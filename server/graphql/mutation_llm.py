from typing import cast
from uuid import UUID

import strawberry
from sqlalchemy import func

from server.database.block_set_util import previous_block_sets_input_blocks
from server.database.orm.block_set import OrmBlockSet
from server.database.orm.prompt_block import OrmPromptBlock
from server.database.orm.user import OrmUser
from server.llm.get_completion import LlmMessage, get_completion

from .context import Info
from .types import BlockSet
from .utils import ensure_db_user


@strawberry.type
class MutationLlm:
    @strawberry.mutation
    @ensure_db_user
    def execute_block_set(
        self: None,
        info: Info,
        db_user: OrmUser,
        block_set_id: UUID,
    ) -> BlockSet | None:
        db = info.context.db

        db_block_set = db.scalar(
            db_user.block_sets.select().where(OrmBlockSet.id == block_set_id)
        )

        if db_block_set == None:
            return None

        if db_block_set.completer_block == None:
            return None

        messages = []

        if db_block_set.system_prompt_block != None:
            messages.append(
                LlmMessage(
                    role="system",
                    content=db_block_set.system_prompt_block.content,
                )
            )

        if db_block_set.is_input_including_previous_block_set_output:
            prompt_blocks = previous_block_sets_input_blocks(
                db=db,
                current_position=db_block_set.position,
                db_preset=db_block_set.preset,
            )

            messages += [
                LlmMessage(role=block.role, content=block.content)
                for block in prompt_blocks
            ]

        if db_block_set.top_input_prompt_block != None:
            messages.append(
                LlmMessage(
                    role="user",
                    content=db_block_set.top_input_prompt_block.content,
                )
            )

        result_message = cast(
            LlmMessage,
            get_completion(
                model=db_block_set.completer_block.model,
                temperature=db_block_set.completer_block.temperature,
                messages=messages,
                stop=db_block_set.completer_block.stop,
            ),
        )

        prompt_block = OrmPromptBlock(
            owner=db_user,
            role=result_message.role,
            content=result_message.content,
        )

        db_block_set.top_output_block = prompt_block

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

from uuid import UUID

import strawberry
from sqlalchemy import func

from server.database.orm.completer_block import OrmCompleterBlock
from server.database.orm.prompt_block import OrmPromptBlock
from server.database.orm.user import OrmUser
from server.database.orm.workspace import OrmWorkspace

from ..context import Info
from ..types import CompleterBlock, DeletionResult, PromptBlock, PromptType
from ..utils import ensure_db_user


@strawberry.type
class MutationBlock:
    @strawberry.mutation
    @ensure_db_user
    def create_prompt_block(
        self: None,
        info: Info,
        db_user: OrmUser,
        workspace_id: UUID,
    ) -> PromptBlock | None:
        db = info.context.db

        db_workspace = db.scalar(
            db_user.workspaces.select().where(OrmWorkspace.id == workspace_id)
        )

        if db_workspace == None:
            return None

        db_prompt_block = OrmPromptBlock(
            owner=db_user,
            workspace=db_workspace,
        )

        db.add(db_prompt_block)

        db_workspace.updated_at = func.now()

        db.commit()

        return PromptBlock(
            db_prompt_block=db_prompt_block,
            id=db_prompt_block.id,
            role=db_prompt_block.role,
            content=db_prompt_block.content,
        )

    @strawberry.mutation
    @ensure_db_user
    def update_prompt_block(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: UUID,
        role: PromptType,
        content: str,
    ) -> PromptBlock | None:
        db = info.context.db

        db_prompt_block = db.scalar(
            db_user.prompt_blocks.select().where(OrmPromptBlock.id == id)
        )

        if db_prompt_block == None:
            return None

        db_prompt_block.role = role
        db_prompt_block.content = content

        db_prompt_block.workspace.updated_at = func.now()

        db.commit()

        return PromptBlock(
            db_prompt_block=db_prompt_block,
            id=db_prompt_block.id,
            role=db_prompt_block.role,
            content=db_prompt_block.content,
        )

    @strawberry.mutation
    @ensure_db_user
    def create_completer_block(
        self: None,
        info: Info,
        db_user: OrmUser,
        workspace_id: UUID,
    ) -> CompleterBlock | None:
        db = info.context.db

        db_workspace = db.scalar(
            db_user.workspaces.select().where(OrmWorkspace.id == workspace_id)
        )

        if db_workspace == None:
            return None

        db_completer_block = OrmCompleterBlock(
            owner=db_user,
            workspace=db_workspace,
        )

        db.add(db_completer_block)

        db_workspace.updated_at = func.now()

        db.commit()

        return CompleterBlock(
            db_completer_block=db_completer_block,
            id=db_completer_block.id,
            model=db_completer_block.model,
            temperature=db_completer_block.temperature,
            stop=db_completer_block.stop,
        )

    @strawberry.mutation
    @ensure_db_user
    def update_completer_block(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: UUID,
        model: str,
        temperature: float,
        stop: str,
    ) -> CompleterBlock | None:
        db = info.context.db

        db_completer_block = db.scalar(
            db_user.completer_blocks.select().where(OrmCompleterBlock.id == id)
        )

        if db_completer_block == None:
            return None

        db_completer_block.model = model
        db_completer_block.temperature = temperature
        db_completer_block.stop = stop

        db_completer_block.workspace.updated_at = func.now()

        db.commit()

        return CompleterBlock(
            db_completer_block=db_completer_block,
            id=db_completer_block.id,
            model=db_completer_block.model,
            temperature=db_completer_block.temperature,
            stop=db_completer_block.stop,
        )

    @strawberry.mutation
    @ensure_db_user
    def delete_block(
        self: None,
        info: Info,
        db_user: OrmUser,
        block_id: UUID,
    ) -> DeletionResult | None:
        db = info.context.db

        try:
            db_block = db.scalar(
                db_user.completer_blocks.select().where(
                    OrmCompleterBlock.id == block_id
                )
            )
            if db_block == None:
                db_block = db.scalar(
                    db_user.prompt_blocks.select().where(
                        OrmPromptBlock.id == block_id
                    )
                )
            if db_block == None:
                return DeletionResult(is_success=False)

            db_workspace = db_block.workspace

            db.delete(db_block)

            db_workspace.updated_at = func.now()

            db.commit()
        except Exception:
            # Delete can fail if the voilates a foreign key constraint,
            # i.e. if the block is referenced by a block set.
            return DeletionResult(is_success=False)
        else:
            return DeletionResult(is_success=True)

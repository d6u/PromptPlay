from uuid import UUID

import strawberry
from sqlalchemy import func

from server.database.orm.block_set import OrmBlockSet
from server.database.orm.completer_block import OrmCompleterBlock
from server.database.orm.preset import OrmPreset
from server.database.orm.prompt_block import OrmPromptBlock, OrmPromptType
from server.database.orm.user import OrmUser

from .context import Info
from .types import BlockSet, DeletionResult, Preset
from .utils import ensure_db_user


@strawberry.type
class MutationBlockSet:
    @strawberry.mutation
    @ensure_db_user
    def create_block_set(
        self: None,
        info: Info,
        db_user: OrmUser,
        preset_id: UUID,
    ) -> BlockSet | None:
        db = info.context.db

        db_preset = db.scalar(
            db_user.presets.select().where(OrmPreset.id == preset_id)
        )

        if db_preset == None:
            return None

        db_top_block_set = db.scalar(
            db_preset.block_sets.select().order_by(OrmBlockSet.position.desc())
        )

        if db_top_block_set == None:
            return None

        db_block_set = OrmBlockSet(owner=db_user, preset=db_preset)
        db_block_set.position = (
            db_top_block_set.position + 1 if db_top_block_set else 0
        )

        db.add(db_block_set)

        db_preset.updated_at = func.now()
        db_preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def update_block_set_options(
        self: None,
        info: Info,
        db_user: OrmUser,
        block_set_id: UUID,
        is_input_including_previous_block_set_output: bool,
        is_output_including_input_blocks: bool,
        is_repeating_current_block_set: bool,
    ) -> BlockSet | None:
        db = info.context.db

        db_block_set = db.scalar(
            db_user.block_sets.select().where(OrmBlockSet.id == block_set_id)
        )

        if db_block_set == None:
            return None

        db_block_set.is_input_including_previous_block_set_output = (
            is_input_including_previous_block_set_output
        )
        db_block_set.is_output_including_input_blocks = (
            is_output_including_input_blocks
        )
        db_block_set.is_repeating_current_block_set = (
            is_repeating_current_block_set
        )

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def delete_block_set(
        self: None,
        info: Info,
        db_user: OrmUser,
        block_set_id: UUID,
    ) -> DeletionResult | None:
        db = info.context.db
        db_user = info.context.db_user

        db_block_set = db.scalar(
            db_user.block_sets.select().where(OrmBlockSet.id == block_set_id)
        )

        if db_block_set == None:
            return DeletionResult(is_success=False)

        db_preset = db_block_set.preset

        db.delete(db_block_set)

        db_preset.updated_at = func.now()
        db_preset.workspace.updated_at = func.now()

        db.commit()

        return DeletionResult(is_success=True)

    @strawberry.mutation
    @ensure_db_user
    def add_prompt_to_block_set_top_input(
        self: None,
        info: Info,
        db_user: OrmUser,
        prompt_block_id: UUID,
        block_set_id: UUID,
    ) -> BlockSet | None:
        db = info.context.db

        db_block_set = db.scalar(
            db_user.block_sets.select().where(OrmBlockSet.id == block_set_id)
        )

        if db_block_set == None:
            return None

        db_prompt_block = db.scalar(
            db_user.prompt_blocks.select().where(
                OrmPromptBlock.id == prompt_block_id
            )
        )

        if db_prompt_block == None:
            return None

        db_block_set.top_input_prompt_block = db_prompt_block

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def add_completer_to_block_set(
        self: None,
        info: Info,
        db_user: OrmUser,
        block_set_id: UUID,
        completer_block_id: UUID,
    ) -> BlockSet | None:
        db = info.context.db

        db_block_set = db.scalar(
            db_user.block_sets.select().where(OrmBlockSet.id == block_set_id)
        )

        if db_block_set == None:
            return None

        db_completer_block = db.scalar(
            db_user.completer_blocks.select().where(
                OrmCompleterBlock.id == completer_block_id
            )
        )

        if db_completer_block == None:
            return None

        db_block_set.completer_block = db_completer_block

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def add_system_prompt_to_block_set(
        self: None,
        info: Info,
        db_user: OrmUser,
        block_set_id: UUID,
        prompt_block_id: UUID,
    ) -> BlockSet | None:
        db = info.context.db

        db_block_set = db.scalar(
            db_user.block_sets.select().where(OrmBlockSet.id == block_set_id)
        )

        if db_block_set == None:
            return None

        db_prompt_block = db.scalar(
            db_user.prompt_blocks.select().where(
                OrmPromptBlock.id == prompt_block_id
            )
        )

        if db_prompt_block == None:
            return None

        db_block_set.system_prompt_block = db_prompt_block

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def create_top_output_block_on_block_set(
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

        db_prompt_block = OrmPromptBlock(
            owner=db_user,
            workspace=db_block_set.preset.workspace,
            role=OrmPromptType.Assistant,
        )

        db_block_set.top_output_block = db_prompt_block

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def add_prompt_to_block_set_top_output(
        self: None,
        info: Info,
        db_user: OrmUser,
        prompt_block_id: UUID,
        block_set_id: UUID,
    ) -> BlockSet | None:
        db = info.context.db

        db_block_set = db.scalar(
            db_user.block_sets.select().where(OrmBlockSet.id == block_set_id)
        )

        if db_block_set == None:
            return None

        db_prompt_block = db.scalar(
            db_user.prompt_blocks.select().where(
                OrmPromptBlock.id == prompt_block_id
            )
        )

        db_block_set.top_output_block = db_prompt_block

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def remove_top_input_from_block_set(
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

        db_block_set.top_input_prompt_block = None

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def remove_system_prompt_from_block_set(
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

        db_block_set.system_prompt_block = None

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def remove_completer_from_block_set(
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

        db_block_set.completer_block = None

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def remove_top_output_from_block_set(
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

        db_block_set.top_output_block = None

        db_block_set.preset.updated_at = func.now()
        db_block_set.preset.workspace.updated_at = func.now()

        db.commit()

        return BlockSet.from_db(db_block_set)

    @strawberry.mutation
    @ensure_db_user
    def swap_block_set_positions(
        self: None,
        info: Info,
        db_user: OrmUser,
        moving_block_set_id: UUID,
        slot_block_set_id: UUID,
    ) -> Preset | None:
        db = info.context.db

        moving_block_set = db.scalar(
            db_user.block_sets.select().where(
                OrmBlockSet.id == moving_block_set_id
            )
        )

        if moving_block_set == None:
            return None

        slot_block_set = db.scalar(
            db_user.block_sets.select().where(
                OrmBlockSet.id == slot_block_set_id
            )
        )

        if slot_block_set == None:
            return None

        if moving_block_set.preset_id != slot_block_set.preset_id:
            return None

        preset_id = moving_block_set.preset_id

        preset = db.scalar(
            db_user.presets.select().where(OrmPreset.id == preset_id)
        )

        if preset == None:
            return None

        block_sets = db.scalars(
            preset.block_sets.select().order_by(OrmBlockSet.position.asc())
        ).all()

        i = 0

        moving_block_set_index = block_sets.index(moving_block_set)
        slot_block_set_index = block_sets.index(slot_block_set)

        for block_set in block_sets:
            if block_set.id == moving_block_set_id:
                continue
            if (
                block_set.id == slot_block_set_id
                and moving_block_set_index > slot_block_set_index
            ):
                moving_block_set.position = i
                i += 1
            block_set.position = i
            i += 1
            if (
                block_set.id == slot_block_set_id
                and moving_block_set_index < slot_block_set_index
            ):
                moving_block_set.position = i
                i += 1

        preset.updated_at = func.now()
        preset.workspace.updated_at = func.now()

        db.commit()

        return Preset(
            db_preset=preset,
            id=preset.id,
            name=preset.name,
        )

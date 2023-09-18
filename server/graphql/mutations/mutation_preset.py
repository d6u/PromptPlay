from uuid import UUID

import strawberry
from sqlalchemy import func

from server.database.orm.block_set import OrmBlockSet
from server.database.orm.preset import OrmPreset
from server.database.orm.user import OrmUser

from ..context import Info
from ..types import Preset
from ..utils import ensure_db_user


@strawberry.type
class MutationPreset:
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

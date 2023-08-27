from __future__ import annotations

import json
from datetime import datetime
from enum import auto
from uuid import UUID

import strawberry
from strenum import LowercaseStrEnum

from server.database.block_set_util import previous_block_sets_input_blocks
from server.database.orm.block_set import OrmBlockSet
from server.database.orm.completer_block import OrmCompleterBlock
from server.database.orm.preset import OrmPreset
from server.database.orm.prompt_block import OrmPromptBlock
from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser
from server.database.orm.workspace import OrmWorkspace

from .context import Info


@strawberry.type
class SpaceV2:
    @classmethod
    def from_db(cls, db_space_v2: OrmSpace) -> SpaceV2:
        return SpaceV2(
            db_space_v2=db_space_v2,
            id=db_space_v2.id,
            name=db_space_v2.name,
            content=json.dumps(db_space_v2.content),
            updated_at=db_space_v2.updated_at,
        )

    db_space_v2: strawberry.Private[OrmSpace]
    id: UUID
    name: str
    content: str | None
    updated_at: datetime

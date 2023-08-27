import json
from typing import cast
from uuid import UUID

import strawberry

from server.database.orm.space_v2 import OrmSpaceV2
from server.database.orm.user import OrmUser

from .context import Info
from .types_v2 import SpaceV2
from .utils import ensure_db_user


@strawberry.type
class MutationSpaceV2:
    @strawberry.mutation
    @ensure_db_user
    def create_space_v2(
        self: None,
        info: Info,
        db_user: OrmUser,
    ) -> SpaceV2 | None:
        db = info.context.db

        db_space_v2 = OrmSpaceV2(owner=db_user)

        db.add(db_space_v2)
        db.commit()

        return SpaceV2.from_db(db_space_v2)

    @strawberry.mutation
    @ensure_db_user
    def update_space_v2(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: UUID,
        name: str | None = strawberry.UNSET,
        content: str | None = strawberry.UNSET,
    ) -> SpaceV2 | None:
        db = info.context.db

        db_space_v2 = db.scalar(
            db_user.spaces_v2.select().where(OrmSpaceV2.id == id)
        )

        if db_space_v2 == None:
            return None

        if name == None:
            raise Exception("name cannot be null")
        elif name != strawberry.UNSET:
            db_space_v2.name = name

        if content == None:
            db_space_v2.content = None
        elif content != strawberry.UNSET:
            db_space_v2.content = json.loads(content)

        db.commit()

        return SpaceV2.from_db(db_space_v2)

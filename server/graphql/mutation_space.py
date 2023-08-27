import json
from typing import cast
from uuid import UUID

import strawberry

from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser
from server.database.utils import create_space_with_example_content

from .context import Info
from .types import Space
from .utils import ensure_db_user


@strawberry.type
class MutationSpace:
    @strawberry.mutation
    @ensure_db_user
    def create_space(
        self: None,
        info: Info,
        db_user: OrmUser,
    ) -> Space | None:
        db = info.context.db

        (db_space_v2,) = create_space_with_example_content(
            db_user=db_user,
            space_name="Example space",
        )

        db.add_all([db_space_v2])

        db.commit()

        return Space.from_db(db_space_v2)

    @strawberry.mutation
    @ensure_db_user
    def update_space(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: UUID,
        name: str | None = strawberry.UNSET,
        content: str | None = strawberry.UNSET,
    ) -> Space | None:
        db = info.context.db

        db_space_v2 = db.scalar(
            db_user.spaces.select().where(OrmSpace.id == id)
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

        return Space.from_db(db_space_v2)

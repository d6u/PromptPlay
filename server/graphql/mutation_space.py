import json

import strawberry

from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser
from server.database.utils import space_example_content

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

        db_space = OrmSpace(
            owner=db_user,
            content=space_example_content(),
        )

        db.add(db_space)
        db.commit()

        return Space.from_db(db_space)

    @strawberry.mutation
    @ensure_db_user
    def update_space(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: strawberry.ID,
        name: str | None = strawberry.UNSET,
        content: str | None = strawberry.UNSET,
    ) -> Space | None:
        db = info.context.db

        db_space = db.scalar(db_user.spaces.select().where(OrmSpace.id == id))

        if db_space == None:
            return None

        if name == None:
            raise Exception("name cannot be null")
        elif name != strawberry.UNSET:
            db_space.name = name

        if content == None:
            db_space.content = None
        elif content != strawberry.UNSET:
            db_space.content = json.loads(content)

        db.commit()

        return Space.from_db(db_space)

    @strawberry.mutation
    @ensure_db_user
    def delete_space(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: strawberry.ID,
    ) -> bool | None:
        db = info.context.db

        db_space = db.scalar(db_user.spaces.select().where(OrmSpace.id == id))

        if db_space == None:
            return False

        db.delete(db_space)
        db.commit()

        return True

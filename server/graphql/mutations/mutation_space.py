import json

import strawberry

from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser
from server.database.utils import space_example_content

from ..context import Info
from ..types import ContentVersion, Space
from ..utils import ensure_db_user


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
            flow_content=space_example_content(),
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
        content_version: ContentVersion | None = strawberry.UNSET,
        content: str | None = strawberry.UNSET,
        flow_content: str | None = strawberry.UNSET,
        content_v3: str | None = strawberry.UNSET,
    ) -> Space | None:
        db = info.context.db

        db_space = db.scalar(db_user.spaces.select().where(OrmSpace.id == id))

        if db_space == None:
            return None

        if name == None:
            raise Exception("name cannot be null")
        elif name != strawberry.UNSET:
            db_space.name = name

        if content_version == None:
            raise Exception("content_version cannot be null")
        elif content_version == ContentVersion.v1:
            raise Exception("content_version cannot be v1")
        elif content_version != strawberry.UNSET:
            db_space.content_version = content_version

        if content == None:
            db_space.content = None
        elif content != strawberry.UNSET:
            db_space.content = json.loads(content)

        if flow_content == None:
            db_space.flow_content = None
        elif flow_content != strawberry.UNSET:
            db_space.flow_content = json.loads(flow_content)

        if content_v3 == None:
            db_space.content_v3 = None
        elif content_v3 != strawberry.UNSET:
            db_space.content_v3 = json.loads(content_v3)

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

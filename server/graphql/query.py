# from __future__ import annotations

from uuid import UUID

import strawberry
from sqlalchemy import select

from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser

from .types import Info, QuerySpaceResult, Space, User
from .utils import ensure_db_user


@strawberry.type
class Query:
    @strawberry.field
    def hello(self: None) -> str:
        return "World!"

    @strawberry.field(
        description="Check if there is a user and the user is not a placeholder user"
    )
    def is_logged_in(self: None, info: Info) -> bool:
        # Need to pull the user from the context to trigger the logic for
        # computing the is_logged_in
        # TODO: Improve this
        db_user = info.context.db_user
        return info.context.is_logged_in

    @strawberry.field(
        description="When PlaceholderUserToken header is present and the token is not mapped to a user"
    )
    def is_placeholder_user_token_invalid(self: None, info: Info) -> bool:
        db = info.context.db

        placeholder_user_token = info.context.request.headers.get(
            "PlaceholderUserToken", None
        )

        if placeholder_user_token == None:
            return False

        db_user = db.scalar(
            select(OrmUser).where(
                OrmUser.placeholder_client_token == placeholder_user_token
            )
        )

        if db_user != None:
            return False

        return True

    @strawberry.field
    @ensure_db_user
    def user(self: None, info: Info, db_user: OrmUser) -> User | None:
        return User.from_db(db_user)

    @strawberry.field
    def space(
        self: None,
        info: Info,
        id: UUID,
    ) -> QuerySpaceResult | None:
        db = info.context.db
        db_user = info.context.db_user

        db_space = db.scalar(select(OrmSpace).where(OrmSpace.id == id))

        if db_space == None:
            return None

        space = Space.from_db(db_space)

        if db_user == None or db_user.id != db_space.owner_id:
            return QuerySpaceResult(is_read_only=True, space=space)
        else:
            return QuerySpaceResult(is_read_only=False, space=space)

    # TODO: Show this in dev mode
    # @strawberry.field
    # def users(self: None, info: Info) -> list[User]:
    #     db = info.context.db
    #     return [User.from_orm(orm) for orm in db.query(OrmUser).all()]

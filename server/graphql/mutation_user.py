from uuid import UUID

import strawberry
from auth0 import Auth0Error
from sqlalchemy import select

from server.database.orm.user import OrmUser

from .context import Info
from .types import User


@strawberry.type
class MutationUser:
    pass
    # TODO: Implement this in the UI
    #
    # @strawberry.mutation
    # def delete_user(
    #     self: None,
    #     info: Info,
    #     user_id: UUID,
    # ) -> bool:
    #     db = info.context.db

    #     db_user = db.scalar(select(OrmUser).where(OrmUser.id == user_id))

    #     if db_user == None:
    #         return False

    #     db.delete(db_user)
    #     db.commit()

    #     return True

from __future__ import annotations

from functools import cached_property
from typing import TypeAlias, cast

from sqlalchemy import select
from sqlalchemy.orm import Session
from strawberry.fastapi import BaseContext
from strawberry.types import Info as _Info
from strawberry.types.info import RootValueType

from server.database.orm.user import OrmUser


class Context(BaseContext):
    db: Session
    is_logged_in: bool = False

    def __init__(self, db: Session) -> None:
        super().__init__()
        self.db = db

    @cached_property
    def db_user(self) -> OrmUser | None:
        """
        Run the following logic step by step:

        1. Check if the request has an Authorization header.
        2. Check if the request has a PlaceholderUserToken header.
        3. If none of above headers are present, return None.
        """

        session_user: dict | None = self.request.session.get("user", None)

        if session_user != None:
            db_user = self._get_db_user_by_session(session_user)

            if db_user != None:
                self.is_logged_in = True
                return db_user

            # This is a invalid session, need to clean it up.
            self.request.session.clear()

        # Fall back to PlaceholderUserToken header

        placeholder_user_token = self.request.headers.get(
            "PlaceholderUserToken", None
        )

        if placeholder_user_token != None:
            db_user = self._get_db_user_by_placeholder_user_token(
                placeholder_user_token=placeholder_user_token,
            )

            if db_user != None:
                return db_user

            print("PlaceholderUserToken header is invalid")

        print("Neither session user nor PlaceholderUserToken header is present")
        return None

    def _get_db_user_by_session(self, session_user: dict) -> OrmUser | None:
        db_user_id = cast(str | None, session_user.get("db_user_id", None))

        if db_user_id == None:
            print("db_user_id is None")
            return None

        db_user = self.db.scalar(
            select(OrmUser).where(OrmUser.id == db_user_id)
        )

        if db_user == None:
            print("db_user is None")
            return None

        print("db_user found")
        return db_user

    def _get_db_user_by_placeholder_user_token(
        self,
        placeholder_user_token: str,
    ) -> OrmUser | None:
        db_user = self.db.scalar(
            select(OrmUser).where(
                OrmUser.placeholder_client_token == placeholder_user_token
            )
        )

        if db_user == None:
            print("Placeholder user not found in local database")
            return None

        print("Placeholder user found in local database")
        return db_user


Info: TypeAlias = _Info[Context, RootValueType]

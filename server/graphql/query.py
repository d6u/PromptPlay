# from __future__ import annotations

from uuid import UUID

import strawberry
from sqlalchemy import select

from server.database.orm.preset import OrmPreset
from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser
from server.database.orm.workspace import OrmWorkspace

from .types import Info, Preset, QuerySpaceResult, Space, User, Workspace
from .utils import ensure_db_user


@strawberry.type
class Query:
    @strawberry.field
    def hello(self: None) -> str:
        return "World!"

    @strawberry.field
    def is_logged_in(self: None, info: Info) -> bool:
        # Need to pull the user from the context to trigger the logic for
        # computing the is_logged_in
        # TODO: Improve this
        db_user = info.context.db_user
        return info.context.is_logged_in

    @strawberry.field
    @ensure_db_user
    def user(self: None, info: Info, db_user: OrmUser) -> User | None:
        return User(
            db_user=db_user,
            id=db_user.id,
            email=db_user.email,
        )

    @strawberry.field
    @ensure_db_user
    def workspace(
        self: None,
        info: Info,
        db_user: OrmUser,
        workspace_id: UUID,
    ) -> Workspace | None:
        db = info.context.db

        db_workspace = db.scalar(
            db_user.workspaces.select().filter(OrmWorkspace.id == workspace_id)
        )

        return Workspace.from_db(db_workspace) if db_workspace != None else None

    @strawberry.field
    @ensure_db_user
    def preset(
        self: None,
        info: Info,
        db_user: OrmUser,
        preset_id: UUID,
    ) -> Preset | None:
        db = info.context.db

        db_preset = db.scalar(
            db_user.presets.select().filter(OrmPreset.id == preset_id)
        )

        return (
            Preset(
                db_preset=db_preset,
                id=db_preset.id,
                name=db_preset.name,
            )
            if db_preset != None
            else None
        )

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

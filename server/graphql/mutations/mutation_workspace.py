from uuid import UUID

import strawberry

from server.database.orm.user import OrmUser
from server.database.orm.workspace import OrmWorkspace
from server.database.utils import create_workspace_with_examples

from ..context import Info
from ..types import DeletionResult, Workspace
from ..utils import ensure_db_user


@strawberry.type
class MutationWorkspace:
    @strawberry.mutation
    @ensure_db_user
    def create_workspace(
        self: None,
        info: Info,
        db_user: OrmUser,
    ) -> Workspace | None:
        db = info.context.db

        (
            db_workspace,
            db_preset,
            db_prompt_block,
            db_completer_block,
            db_block_set,
        ) = create_workspace_with_examples(
            db_user=db_user,
            space_name="Untitled space",
        )

        db.add_all(
            [
                db_workspace,
                db_prompt_block,
                db_completer_block,
                db_preset,
                db_block_set,
            ]
        )
        db.commit()

        return Workspace.from_db(db_workspace)

    @strawberry.mutation
    @ensure_db_user
    def update_workspace(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: UUID,
        name: str,
    ) -> Workspace | None:
        db = info.context.db

        db_workspace = db.scalar(
            db_user.workspaces.select().where(OrmWorkspace.id == id)
        )

        if db_workspace == None:
            return None

        db_workspace.name = name

        db.commit()

        return Workspace.from_db(db_workspace)

    @strawberry.mutation
    @ensure_db_user
    def delete_workspace(
        self: None,
        info: Info,
        db_user: OrmUser,
        id: UUID,
    ) -> DeletionResult | None:
        db = info.context.db

        db_workspace = db.scalar(
            db_user.workspaces.select().where(OrmWorkspace.id == id)
        )

        if db_workspace == None:
            return DeletionResult(is_success=False)

        db.delete(db_workspace)

        db.commit()

        return DeletionResult(is_success=True)

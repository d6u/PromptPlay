from uuid import uuid4

import strawberry
from sqlalchemy import select

from server.database.orm.user import OrmUser
from server.database.utils import (
    create_example_workspace,
    create_space_with_example_content,
)

from .context import Info
from .mutation_block import MutationBlock
from .mutation_block_set import MutationBlockSet
from .mutation_llm import MutationLlm
from .mutation_preset import MutationPreset
from .mutation_space import MutationSpace
from .mutation_user import MutationUser
from .mutation_workspace import MutationWorkspace
from .types import (
    CreateExampleWorkspaceResult,
    CreatePlaceholderUserAndExampleSpaceResult,
    Space,
    Workspace,
)
from .utils import ensure_db_user


@strawberry.type
class Mutation(
    MutationUser,
    MutationWorkspace,
    MutationPreset,
    MutationBlockSet,
    MutationBlock,
    MutationLlm,
    MutationSpace,
):
    @strawberry.mutation
    def create_example_workspace(
        self: None,
        info: Info,
    ) -> CreateExampleWorkspaceResult | None:
        db = info.context.db
        db_user = info.context.db_user

        if db_user == None:
            placeholder_client_token = uuid4()
            db_user = OrmUser(
                is_user_placeholder=True,
                placeholder_client_token=placeholder_client_token,
            )
        else:
            placeholder_client_token = db_user.placeholder_client_token

        (
            db_workspace,
            db_preset,
            db_prompt_block,
            db_completer_block,
            db_block_set,
        ) = create_example_workspace(db_user=db_user)

        db.add_all(
            [
                db_user,
                db_workspace,
                db_prompt_block,
                db_completer_block,
                db_preset,
                db_block_set,
            ]
        )
        db.commit()

        return CreateExampleWorkspaceResult(
            is_success=True,
            placeholder_client_token=placeholder_client_token,
            space=Workspace.from_db(db_workspace),
        )

    @strawberry.mutation
    def create_placeholder_user_and_example_space(
        self: None,
        info: Info,
    ) -> CreatePlaceholderUserAndExampleSpaceResult:
        db = info.context.db
        db_user = info.context.db_user

        if db_user == None:
            placeholder_client_token = uuid4()
            db_user = OrmUser(
                is_user_placeholder=True,
                placeholder_client_token=placeholder_client_token,
            )
        else:
            placeholder_client_token = db_user.placeholder_client_token

        db_space = create_space_with_example_content(db_user=db_user)

        db.add_all([db_user, db_space])
        db.commit()

        return CreatePlaceholderUserAndExampleSpaceResult(
            placeholder_client_token=placeholder_client_token,
            space=Space.from_db(db_space),
        )

    @strawberry.mutation
    @ensure_db_user
    def merge_placeholder_user_with_logged_in_user(
        self: None,
        info: Info,
        db_user: OrmUser,
        placeholder_user_token: str,
    ) -> bool | None:
        db = info.context.db

        db_placeholder_user = db.scalar(
            select(OrmUser).where(
                OrmUser.placeholder_client_token == placeholder_user_token
            )
        )

        if db_placeholder_user == None:
            return False

        # Merge placeholder user into the new user

        db_spaces = db.scalars(db_placeholder_user.spaces.select())

        for db_space in db_spaces:
            db_space.owner = db_user

        # Delete the placeholder user
        db.delete(db_placeholder_user)

        db.commit()

        return True

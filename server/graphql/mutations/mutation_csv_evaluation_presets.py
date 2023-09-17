import json

import strawberry

from server.database.orm.csv_evaluation_preset import OrmCSVEvaluationPreset
from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser
from server.database.utils import space_example_content

from ..context import Info
from ..types import CSVEvaluationPreset, Space
from ..utils import ensure_db_user


@strawberry.type
class MutationCSVEvaluationPreset:
    @strawberry.mutation
    @ensure_db_user
    def create_csv_evaluation_preset(
        self: None,
        info: Info,
        db_user: OrmUser,
        space_id: strawberry.ID,
        name: str,
        csvContent: str | None = strawberry.UNSET,
    ) -> CSVEvaluationPreset | None:
        db = info.context.db

        db_space = db.scalar(
            db_user.spaces.select().where(OrmSpace.id == space_id)
        )

        if db_space == None:
            return None

        db_csv_evaluation_preset = OrmCSVEvaluationPreset(
            owner=db_user,
            space=db_space,
            name=name,
            csv_content=csvContent,
        )

        db.add(db_csv_evaluation_preset)
        db.commit()

        return CSVEvaluationPreset.from_db(db_csv_evaluation_preset)

    @strawberry.mutation
    @ensure_db_user
    def update_csv_evaluation_preset(
        self: None,
        info: Info,
        db_user: OrmUser,
        preset_id: strawberry.ID,
        name: str | None = strawberry.UNSET,
        csv_content: str | None = strawberry.UNSET,
    ) -> CSVEvaluationPreset | None:
        db = info.context.db

        db_csv_evaluation_preset = db.scalar(
            db_user.csv_evaluation_presets.select().where(
                OrmCSVEvaluationPreset.id == preset_id
            )
        )

        if db_csv_evaluation_preset == None:
            return None

        if name == None:
            raise Exception("name cannot be null")
        elif name != strawberry.UNSET:
            db_csv_evaluation_preset.name = name

        if csv_content == None:
            db_csv_evaluation_preset.csv_content = None
        elif csv_content != strawberry.UNSET:
            db_csv_evaluation_preset.csv_content = csv_content

        db.commit()

        return CSVEvaluationPreset.from_db(db_csv_evaluation_preset)

    # @strawberry.mutation
    # @ensure_db_user
    # def delete_space(
    #     self: None,
    #     info: Info,
    #     db_user: OrmUser,
    #     id: strawberry.ID,
    # ) -> bool | None:
    #     db = info.context.db

    #     db_space = db.scalar(db_user.spaces.select().where(OrmSpace.id == id))

    #     if db_space == None:
    #         return False

    #     db.delete(db_space)
    #     db.commit()

    #     return True

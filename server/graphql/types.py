from __future__ import annotations

import json
from datetime import datetime
from enum import auto
from uuid import UUID

import strawberry
from strenum import LowercaseStrEnum

from server.database.orm.block_set import OrmBlockSet
from server.database.orm.completer_block import OrmCompleterBlock
from server.database.orm.csv_evaluation_preset import OrmCSVEvaluationPreset
from server.database.orm.preset import OrmPreset
from server.database.orm.prompt_block import OrmPromptBlock
from server.database.orm.space import OrmSpace
from server.database.orm.user import OrmUser
from server.database.orm.workspace import OrmWorkspace

from .context import Info


@strawberry.type
class User:
    @classmethod
    def from_db(cls, db_user: OrmUser) -> User:
        return User(
            db_user=db_user,
            id=db_user.id,
            email=db_user.email,
            profile_picture_url=db_user.profile_picture_url,
        )

    db_user: strawberry.Private[OrmUser]
    id: UUID
    email: str | None
    profile_picture_url: str | None

    @strawberry.field
    def spaces(self: User, info: Info) -> list[Space]:
        db = info.context.db

        spaces = db.scalars(
            self.db_user.spaces.select().order_by(OrmSpace.updated_at.desc())
        )

        return [Space.from_db(s) for s in spaces]


@strawberry.enum
class ContentVersion(LowercaseStrEnum):
    v1 = auto()
    v2 = auto()
    v3 = auto()


@strawberry.type
class Space:
    @classmethod
    def from_db(cls, db_space: OrmSpace) -> Space:
        flow_content = (
            json.dumps(db_space.flow_content)
            if db_space.flow_content != None
            else None
        )
        content_v3 = (
            json.dumps(db_space.content_v3)
            if db_space.content_v3 != None
            else None
        )

        return Space(
            db_space=db_space,
            id=db_space.id,
            name=db_space.name,
            content_version=ContentVersion(db_space.content_version)
            if db_space.content_version != None
            else ContentVersion.v1,
            content=json.dumps(db_space.content),
            flow_content=flow_content,
            content_v3=content_v3,
            updated_at=db_space.updated_at,
        )

    db_space: strawberry.Private[OrmSpace]
    id: strawberry.ID
    name: str
    content_version: ContentVersion
    content: str | None
    flow_content: str | None
    content_v3: str | None
    updated_at: datetime

    @strawberry.field
    def csv_evaluation_presets(
        self: Space, info: Info
    ) -> list[CSVEvaluationPreset]:
        db = info.context.db

        csv_evaluation_presets = db.scalars(
            self.db_space.csv_evaluation_presets.select().order_by(
                OrmCSVEvaluationPreset.updated_at.desc()
            )
        )

        return [CSVEvaluationPreset.from_db(p) for p in csv_evaluation_presets]

    @strawberry.field
    def csv_evaluation_preset(
        self: Space,
        info: Info,
        id: strawberry.ID,
    ) -> CSVEvaluationPreset:
        db = info.context.db

        csv_evaluation_preset = db.scalar(
            self.db_space.csv_evaluation_presets.select().where(
                OrmCSVEvaluationPreset.id == id
            )
        )

        if csv_evaluation_preset == None:
            return None

        return CSVEvaluationPreset.from_db(csv_evaluation_preset)


@strawberry.type
class CSVEvaluationPreset:
    @classmethod
    def from_db(
        cls, db_csv_evaluation_preset: OrmCSVEvaluationPreset
    ) -> CSVEvaluationPreset:
        config_content = (
            json.dumps(db_csv_evaluation_preset.config_content)
            if db_csv_evaluation_preset.config_content != None
            else None
        )

        return CSVEvaluationPreset(
            db_csv_evaluation_preset=db_csv_evaluation_preset,
            id=db_csv_evaluation_preset.id,
            name=db_csv_evaluation_preset.name,
            csv_content=db_csv_evaluation_preset.csv_content,
            config_content=config_content,
        )

    db_csv_evaluation_preset: strawberry.Private[OrmCSVEvaluationPreset]
    id: strawberry.ID
    name: str
    csv_content: str
    config_content: str | None


@strawberry.type
class QuerySpaceResult:
    is_read_only: bool
    space: Space


@strawberry.type
class CreatePlaceholderUserAndExampleSpaceResult:
    placeholder_client_token: strawberry.ID
    space: Space

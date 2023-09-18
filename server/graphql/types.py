from __future__ import annotations

import json
from datetime import datetime
from enum import auto
from uuid import UUID

import strawberry
from strenum import LowercaseStrEnum

from server.database.block_set_util import previous_block_sets_input_blocks
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
    def from_db(cls, db_user: OrmUser) -> Workspace:
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
    def workspaces(self: User, info: Info) -> list[Workspace]:
        db = info.context.db

        return [
            Workspace.from_db(w)
            for w in db.scalars(
                self.db_user.workspaces.select().order_by(
                    OrmWorkspace.updated_at.desc()
                )
            )
        ]

    @strawberry.field
    def spaces(self: User, info: Info) -> list[Space]:
        db = info.context.db

        spaces = db.scalars(
            self.db_user.spaces.select().order_by(OrmSpace.updated_at.desc())
        )

        return [Space.from_db(s) for s in spaces]


@strawberry.type
class Workspace:
    @classmethod
    def from_db(cls, db_workspace: OrmWorkspace) -> Workspace:
        return Workspace(
            db_workspace=db_workspace,
            id=db_workspace.id,
            name=db_workspace.name,
            updated_at=db_workspace.updated_at,
        )

    db_workspace: strawberry.Private[OrmWorkspace]
    id: UUID
    name: str
    updated_at: datetime

    @strawberry.field
    def first_preset(self: Workspace, info: Info) -> Preset | None:
        db = info.context.db

        db_preset = db.scalar(
            self.db_workspace.presets.select().order_by(
                OrmPreset.updated_at.desc()
            )
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
    def presets(self: Workspace, info: Info) -> list[Preset]:
        db = info.context.db

        return [
            Preset(
                db_preset=p,
                id=p.id,
                name=p.name,
            )
            for p in db.scalars(
                self.db_workspace.presets.select().order_by(
                    OrmPreset.updated_at.desc()
                )
            )
        ]

    @strawberry.field
    def preset(self: Workspace, info: Info, preset_id: UUID) -> Preset:
        db = info.context.db

        db_preset = db.scalar(
            self.db_workspace.presets.select().where(OrmPreset.id == preset_id)
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
    def blocks(self: Workspace, info: Info) -> list[Block]:
        db = info.context.db

        return [
            CompleterBlock(
                db_completer_block=b,
                id=b.id,
                model=b.model,
                temperature=b.temperature,
                stop=b.stop,
            )
            for b in db.scalars(self.db_workspace.completer_blocks.select())
        ] + [
            PromptBlock(
                db_prompt_block=b,
                id=b.id,
                role=b.role,
                content=b.content,
            )
            for b in db.scalars(self.db_workspace.prompt_blocks.select())
        ]


@strawberry.type
class Preset:
    db_preset: strawberry.Private[OrmPreset]
    id: UUID
    name: str

    @strawberry.field
    def block_sets(self: Preset, info: Info) -> list[BlockSet]:
        db = info.context.db

        return [
            BlockSet.from_db(bs)
            for bs in db.scalars(
                self.db_preset.block_sets.select().order_by(
                    OrmBlockSet.position.asc()
                )
            )
        ]


@strawberry.type
class BlockSet:
    @classmethod
    def from_db(cls, db_block_set: OrmBlockSet | None) -> BlockSet | None:
        return (
            BlockSet(
                db_block_set=db_block_set,
                id=db_block_set.id,
                position=db_block_set.position,
                is_input_including_previous_block_set_output=db_block_set.is_input_including_previous_block_set_output,
                is_output_including_input_blocks=db_block_set.is_output_including_input_blocks,
                is_repeating_current_block_set=db_block_set.is_repeating_current_block_set,
            )
            if db_block_set != None
            else None
        )

    db_block_set: strawberry.Private[OrmBlockSet]
    id: UUID
    position: int
    is_input_including_previous_block_set_output: bool
    is_output_including_input_blocks: bool
    is_repeating_current_block_set: bool

    @strawberry.field
    def top_input_prompt_block(
        self: BlockSet,
        info: Info,
    ) -> PromptBlock | None:
        db_prompt_block = self.db_block_set.top_input_prompt_block

        return (
            PromptBlock(
                db_prompt_block=db_prompt_block,
                id=db_prompt_block.id,
                role=db_prompt_block.role,
                content=db_prompt_block.content,
            )
            if db_prompt_block != None
            else None
        )

    @strawberry.field
    def system_prompt_block(self: BlockSet, info: Info) -> PromptBlock | None:
        db_prompt_block = self.db_block_set.system_prompt_block

        return (
            PromptBlock(
                db_prompt_block=db_prompt_block,
                id=db_prompt_block.id,
                role=db_prompt_block.role,
                content=db_prompt_block.content,
            )
            if db_prompt_block != None
            else None
        )

    @strawberry.field
    def completer_block(self: BlockSet, info: Info) -> CompleterBlock | None:
        db_completer_block = self.db_block_set.completer_block

        return (
            CompleterBlock(
                db_completer_block=db_completer_block,
                id=db_completer_block.id,
                model=db_completer_block.model,
                temperature=db_completer_block.temperature,
                stop=db_completer_block.stop,
            )
            if db_completer_block != None
            else None
        )

    @strawberry.field
    def top_output_block(self: BlockSet, info: Info) -> PromptBlock | None:
        db_prompt_block = self.db_block_set.top_output_block

        return (
            PromptBlock(
                db_prompt_block=db_prompt_block,
                id=db_prompt_block.id,
                role=db_prompt_block.role,
                content=db_prompt_block.content,
            )
            if db_prompt_block != None
            else None
        )

    @strawberry.field
    def previous_block_sets_input_blocks(
        self: BlockSet,
        info: Info,
    ) -> list[PromptBlock]:
        db = info.context.db

        return (
            PromptBlock(
                db_prompt_block=b,
                id=b.id,
                role=b.role,
                content=b.content,
            )
            for b in previous_block_sets_input_blocks(
                db=db,
                current_position=self.position,
                db_preset=self.db_block_set.preset,
            )
        )


@strawberry.interface
class Block:
    id: UUID


@strawberry.type
class CompleterBlock(Block):
    db_completer_block: strawberry.Private[OrmCompleterBlock]
    id: UUID
    model: str
    temperature: float
    stop: str


@strawberry.enum
class PromptType(LowercaseStrEnum):
    System = auto()
    User = auto()
    Assistant = auto()


@strawberry.type
class PromptBlock(Block):
    db_prompt_block: strawberry.Private[OrmPromptBlock]
    id: UUID
    role: PromptType
    content: str


@strawberry.type
class DeletionResult:
    is_success: bool


@strawberry.enum
class ContentVersion(LowercaseStrEnum):
    v1 = auto()
    v2 = auto()


@strawberry.type
class Space:
    @classmethod
    def from_db(cls, db_space: OrmSpace) -> Space:
        flow_content = (
            json.dumps(db_space.flow_content)
            if db_space.flow_content != None
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
            updated_at=db_space.updated_at,
        )

    db_space: strawberry.Private[OrmSpace]
    id: strawberry.ID
    name: str
    content_version: ContentVersion
    content: str | None
    flow_content: str | None
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
class CreateExampleWorkspaceResult:
    is_success: bool
    placeholder_client_token: UUID | None
    space: Workspace | None


@strawberry.type
class QuerySpaceResult:
    is_read_only: bool
    space: Space


@strawberry.type
class CreatePlaceholderUserAndExampleSpaceResult:
    placeholder_client_token: strawberry.ID
    space: Space

from typing import Any
from uuid import uuid4

from .orm.block_set import OrmBlockSet
from .orm.completer_block import OrmCompleterBlock
from .orm.preset import OrmPreset
from .orm.prompt_block import OrmPromptBlock, OrmPromptType
from .orm.space import OrmSpace
from .orm.user import OrmUser
from .orm.workspace import OrmWorkspace


def create_example_workspace(
    db_user: OrmUser,
) -> tuple[
    OrmWorkspace,
    OrmPreset,
    OrmPromptBlock,
    OrmCompleterBlock,
    OrmBlockSet,
]:
    return create_workspace_with_examples(
        db_user=db_user,
        space_name="Example space",
    )


def create_workspace_with_examples(
    db_user: OrmUser,
    space_name: str,
) -> tuple[
    OrmWorkspace,
    OrmPreset,
    OrmPromptBlock,
    OrmCompleterBlock,
    OrmBlockSet,
]:
    db_workspace = OrmWorkspace(
        name=space_name,
        owner=db_user,
    )

    db_preset = OrmPreset(
        name="Example preset",
        owner=db_user,
        workspace=db_workspace,
    )

    db_prompt_block = OrmPromptBlock(
        role=OrmPromptType.User,
        content="write me a short poem in fewer than 20 words.",
        owner=db_user,
        workspace=db_workspace,
    )

    db_completer_block = OrmCompleterBlock(
        owner=db_user,
        workspace=db_workspace,
    )

    db_block_set = OrmBlockSet(
        owner=db_user,
        preset=db_preset,
        top_input_prompt_block=db_prompt_block,
        completer_block=db_completer_block,
    )

    return (
        db_workspace,
        db_preset,
        db_prompt_block,
        db_completer_block,
        db_block_set,
    )


def create_space_with_example_content(db_user: OrmUser) -> OrmSpace:
    db_space_v2 = OrmSpace(
        name="Example space",
        owner=db_user,
        content=space_example_content(),
    )

    return db_space_v2


def space_example_content() -> dict[str, Any]:
    block1_id = str(uuid4())
    block2_id = str(uuid4())

    return {
        "root": {
            "id": "root",
            "blocks": [
                {
                    "id": block1_id,
                },
                {
                    "id": block2_id,
                },
            ],
        },
        "components": {
            block1_id: {
                "id": block1_id,
                "type": "LlmMessage",
                "role": "user",
                "content": "Write a short poem in fewer than 20 words.",
                "listNameToAppend": "messages",
                "inputConfiguration": "Map",
                "inputMap": [["", ""]],
                "outputConfiguration": "Single",
                "singleOuput": "",
            },
            block2_id: {
                "id": block2_id,
                "type": "Llm",
                "model": "gpt-3.5-turbo",
                "temperature": 0.8,
                "stop": [],
                "variableNameForContent": "",
                "inputConfiguration": "Single",
                "singleInput": "messages",
                "outputConfiguration": "Single",
                "singleOuput": "",
            },
        },
    }

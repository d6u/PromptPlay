from typing import Any

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
        flow_content=space_example_content(),
    )

    return db_space_v2


# Created this example by create a flow and copy the flow_content value here
def space_example_content() -> dict[str, Any]:
    return {
        "edges": [
            {
                "id": "reactflow__edge-3upwVVYYRZZwjcuZwiTSm3upwVVYYRZZwjcuZwiTSm/messages_out-3_irf5gT1ZhuKVEElxTqg3_irf5gT1ZhuKVEElxTqg/messages_in",
                "source": "3upwVVYYRZZwjcuZwiTSm",
                "target": "3_irf5gT1ZhuKVEElxTqg",
                "sourceHandle": "3upwVVYYRZZwjcuZwiTSm/messages_out",
                "targetHandle": "3_irf5gT1ZhuKVEElxTqg/messages_in",
            },
            {
                "id": "reactflow__edge-2XrGop8p5DrCgmXWrqJiH2XrGop8p5DrCgmXWrqJiH/messages_out-fk4ZFsHmy2ep80M7cKvPZfk4ZFsHmy2ep80M7cKvPZ/messages_in",
                "source": "2XrGop8p5DrCgmXWrqJiH",
                "target": "fk4ZFsHmy2ep80M7cKvPZ",
                "sourceHandle": "2XrGop8p5DrCgmXWrqJiH/messages_out",
                "targetHandle": "fk4ZFsHmy2ep80M7cKvPZ/messages_in",
            },
            {
                "id": "reactflow__edge-fk4ZFsHmy2ep80M7cKvPZfk4ZFsHmy2ep80M7cKvPZ/content-v8M2HyqFV_TDsq34nktN3v8M2HyqFV_TDsq34nktN3/DtuAIv8WlAKmfGpAZcUMC",
                "source": "fk4ZFsHmy2ep80M7cKvPZ",
                "target": "v8M2HyqFV_TDsq34nktN3",
                "sourceHandle": "fk4ZFsHmy2ep80M7cKvPZ/content",
                "targetHandle": "v8M2HyqFV_TDsq34nktN3/DtuAIv8WlAKmfGpAZcUMC",
            },
            {
                "id": "reactflow__edge-3_irf5gT1ZhuKVEElxTqg3_irf5gT1ZhuKVEElxTqg/content-v8M2HyqFV_TDsq34nktN3v8M2HyqFV_TDsq34nktN3/-NLoVqVvlhdv3zxtoTXzI",
                "source": "3_irf5gT1ZhuKVEElxTqg",
                "target": "v8M2HyqFV_TDsq34nktN3",
                "sourceHandle": "3_irf5gT1ZhuKVEElxTqg/content",
                "targetHandle": "v8M2HyqFV_TDsq34nktN3/-NLoVqVvlhdv3zxtoTXzI",
            },
            {
                "id": "reactflow__edge-3_irf5gT1ZhuKVEElxTqg3_irf5gT1ZhuKVEElxTqg/content-2XrGop8p5DrCgmXWrqJiH2XrGop8p5DrCgmXWrqJiH/zd8RO5Q9jtkKDyZdmh5c-",
                "source": "3_irf5gT1ZhuKVEElxTqg",
                "target": "2XrGop8p5DrCgmXWrqJiH",
                "sourceHandle": "3_irf5gT1ZhuKVEElxTqg/content",
                "targetHandle": "2XrGop8p5DrCgmXWrqJiH/zd8RO5Q9jtkKDyZdmh5c-",
            },
            {
                "id": "reactflow__edge-oWbAmcHY3DjD3eOHmq9H5oWbAmcHY3DjD3eOHmq9H5/6-P2EOvsbeZyv8QZ8DwX6-3upwVVYYRZZwjcuZwiTSm3upwVVYYRZZwjcuZwiTSm/GmGNV5iusJH-GGUUx7TaV",
                "source": "oWbAmcHY3DjD3eOHmq9H5",
                "target": "3upwVVYYRZZwjcuZwiTSm",
                "sourceHandle": "oWbAmcHY3DjD3eOHmq9H5/6-P2EOvsbeZyv8QZ8DwX6",
                "targetHandle": "3upwVVYYRZZwjcuZwiTSm/GmGNV5iusJH-GGUUx7TaV",
            },
        ],
        "nodes": [
            {
                "id": "oWbAmcHY3DjD3eOHmq9H5",
                "data": None,
                "type": "InputNode",
                "width": 300,
                "height": 132,
                "position": {"x": -250.42481085866984, "y": 370.2400820504546},
            },
            {
                "id": "v8M2HyqFV_TDsq34nktN3",
                "data": None,
                "type": "OutputNode",
                "width": 300,
                "height": 169,
                "position": {"x": 1668.6742274498731, "y": 711.2470829560161},
            },
            {
                "id": "3upwVVYYRZZwjcuZwiTSm",
                "data": None,
                "type": "ChatGPTMessageNode",
                "width": 300,
                "height": 601,
                "position": {"x": 103, "y": 277},
            },
            {
                "id": "3_irf5gT1ZhuKVEElxTqg",
                "data": None,
                "type": "ChatGPTChatCompletionNode",
                "width": 300,
                "height": 646,
                "position": {"x": 482.87529170439836, "y": 382.4694918041199},
            },
            {
                "id": "2XrGop8p5DrCgmXWrqJiH",
                "data": None,
                "type": "ChatGPTMessageNode",
                "width": 300,
                "height": 601,
                "position": {"x": 886.8529512316734, "y": 10.637543289130988},
            },
            {
                "id": "fk4ZFsHmy2ep80M7cKvPZ",
                "data": None,
                "type": "ChatGPTChatCompletionNode",
                "width": 300,
                "height": 646,
                "position": {"x": 1284.8082702862237, "y": 35.68455786976823},
            },
        ],
        "nodeConfigs": {
            "2XrGop8p5DrCgmXWrqJiH": {
                "role": "user",
                "inputs": [
                    {
                        "id": "2XrGop8p5DrCgmXWrqJiH/messages_in",
                        "name": "messages",
                    },
                    {
                        "id": "2XrGop8p5DrCgmXWrqJiH/zd8RO5Q9jtkKDyZdmh5c-",
                        "name": "content",
                    },
                ],
                "nodeId": "2XrGop8p5DrCgmXWrqJiH",
                "content": "Translate below content into Spanish:\n{{content}}",
                "outputs": [
                    {
                        "id": "2XrGop8p5DrCgmXWrqJiH/message",
                        "name": "message",
                        "value": {
                            "role": "user",
                            "content": "Translate below content into Spanish:\nIn Metaverse&#39;s realm, dreams entwine,\nWhere digital pulses start to shine.\nA universe, ethereal and vast,\nWhere avatars dance and futures contrast.\nImaginary wonders, realities entwined,\nMetaverse&#39;s symphony, forever in our mind.",
                        },
                    },
                    {
                        "id": "2XrGop8p5DrCgmXWrqJiH/messages_out",
                        "name": "messages",
                        "value": [
                            {
                                "role": "user",
                                "content": "Translate below content into Spanish:\nIn Metaverse&#39;s realm, dreams entwine,\nWhere digital pulses start to shine.\nA universe, ethereal and vast,\nWhere avatars dance and futures contrast.\nImaginary wonders, realities entwined,\nMetaverse&#39;s symphony, forever in our mind.",
                            }
                        ],
                    },
                ],
                "nodeType": "ChatGPTMessageNode",
            },
            "3_irf5gT1ZhuKVEElxTqg": {
                "stop": [],
                "model": "gpt-3.5-turbo",
                "inputs": [
                    {
                        "id": "3_irf5gT1ZhuKVEElxTqg/messages_in",
                        "name": "messages",
                    }
                ],
                "nodeId": "3_irf5gT1ZhuKVEElxTqg",
                "outputs": [
                    {
                        "id": "3_irf5gT1ZhuKVEElxTqg/content",
                        "name": "content",
                        "value": "In Metaverse's realm, dreams entwine,\nWhere digital pulses start to shine.\nA universe, ethereal and vast,\nWhere avatars dance and futures contrast.\nImaginary wonders, realities entwined,\nMetaverse's symphony, forever in our mind.",
                    },
                    {
                        "id": "3_irf5gT1ZhuKVEElxTqg/message",
                        "name": "message",
                        "value": {
                            "role": "assistant",
                            "content": "In Metaverse's realm, dreams entwine,\nWhere digital pulses start to shine.\nA universe, ethereal and vast,\nWhere avatars dance and futures contrast.\nImaginary wonders, realities entwined,\nMetaverse's symphony, forever in our mind.",
                        },
                    },
                    {
                        "id": "3_irf5gT1ZhuKVEElxTqg/messages_out",
                        "name": "messages",
                        "value": [
                            {
                                "role": "user",
                                "content": "Write a poem about Metaverse in fewer than 50 words.",
                            },
                            {
                                "role": "assistant",
                                "content": "In Metaverse's realm, dreams entwine,\nWhere digital pulses start to shine.\nA universe, ethereal and vast,\nWhere avatars dance and futures contrast.\nImaginary wonders, realities entwined,\nMetaverse's symphony, forever in our mind.",
                            },
                        ],
                    },
                ],
                "nodeType": "ChatGPTChatCompletionNode",
                "temperature": 1,
            },
            "3upwVVYYRZZwjcuZwiTSm": {
                "role": "user",
                "inputs": [
                    {
                        "id": "3upwVVYYRZZwjcuZwiTSm/messages_in",
                        "name": "messages",
                    },
                    {
                        "id": "3upwVVYYRZZwjcuZwiTSm/GmGNV5iusJH-GGUUx7TaV",
                        "name": "topic",
                    },
                ],
                "nodeId": "3upwVVYYRZZwjcuZwiTSm",
                "content": "Write a poem about {{topic}} in fewer than 50 words.",
                "outputs": [
                    {
                        "id": "3upwVVYYRZZwjcuZwiTSm/message",
                        "name": "message",
                        "value": {
                            "role": "user",
                            "content": "Write a poem about Metaverse in fewer than 50 words.",
                        },
                    },
                    {
                        "id": "3upwVVYYRZZwjcuZwiTSm/messages_out",
                        "name": "messages",
                        "value": [
                            {
                                "role": "user",
                                "content": "Write a poem about Metaverse in fewer than 50 words.",
                            }
                        ],
                    },
                ],
                "nodeType": "ChatGPTMessageNode",
            },
            "fk4ZFsHmy2ep80M7cKvPZ": {
                "stop": [],
                "model": "gpt-3.5-turbo",
                "inputs": [
                    {
                        "id": "fk4ZFsHmy2ep80M7cKvPZ/messages_in",
                        "name": "messages",
                    }
                ],
                "nodeId": "fk4ZFsHmy2ep80M7cKvPZ",
                "outputs": [
                    {
                        "id": "fk4ZFsHmy2ep80M7cKvPZ/content",
                        "name": "content",
                        "value": "En el reino del Metaverso, los sueños se entrelazan,\nDonde los pulsos digitales comienzan a brillar.\nUn universo, etéreo y vasto,\nDonde los avatares bailan y los futuros contrastan.\nMaravillas imaginarias, realidades entrelazadas,\nLa sinfonía del Metaverso, siempre en nuestra mente.",
                    },
                    {
                        "id": "fk4ZFsHmy2ep80M7cKvPZ/message",
                        "name": "message",
                        "value": {
                            "role": "assistant",
                            "content": "En el reino del Metaverso, los sueños se entrelazan,\nDonde los pulsos digitales comienzan a brillar.\nUn universo, etéreo y vasto,\nDonde los avatares bailan y los futuros contrastan.\nMaravillas imaginarias, realidades entrelazadas,\nLa sinfonía del Metaverso, siempre en nuestra mente.",
                        },
                    },
                    {
                        "id": "fk4ZFsHmy2ep80M7cKvPZ/messages_out",
                        "name": "messages",
                        "value": [
                            {
                                "role": "user",
                                "content": "Translate below content into Spanish:\nIn Metaverse&#39;s realm, dreams entwine,\nWhere digital pulses start to shine.\nA universe, ethereal and vast,\nWhere avatars dance and futures contrast.\nImaginary wonders, realities entwined,\nMetaverse&#39;s symphony, forever in our mind.",
                            },
                            {
                                "role": "assistant",
                                "content": "En el reino del Metaverso, los sueños se entrelazan,\nDonde los pulsos digitales comienzan a brillar.\nUn universo, etéreo y vasto,\nDonde los avatares bailan y los futuros contrastan.\nMaravillas imaginarias, realidades entrelazadas,\nLa sinfonía del Metaverso, siempre en nuestra mente.",
                            },
                        ],
                    },
                ],
                "nodeType": "ChatGPTChatCompletionNode",
                "temperature": 1,
            },
            "oWbAmcHY3DjD3eOHmq9H5": {
                "nodeId": "oWbAmcHY3DjD3eOHmq9H5",
                "outputs": [
                    {
                        "id": "oWbAmcHY3DjD3eOHmq9H5/6-P2EOvsbeZyv8QZ8DwX6",
                        "name": "topic",
                        "value": "Metaverse",
                        "valueType": "String",
                    }
                ],
                "nodeType": "InputNode",
            },
            "v8M2HyqFV_TDsq34nktN3": {
                "inputs": [
                    {
                        "id": "v8M2HyqFV_TDsq34nktN3/-NLoVqVvlhdv3zxtoTXzI",
                        "name": "english",
                        "value": "In Metaverse's realm, dreams entwine,\nWhere digital pulses start to shine.\nA universe, ethereal and vast,\nWhere avatars dance and futures contrast.\nImaginary wonders, realities entwined,\nMetaverse's symphony, forever in our mind.",
                    },
                    {
                        "id": "v8M2HyqFV_TDsq34nktN3/DtuAIv8WlAKmfGpAZcUMC",
                        "name": "spanish",
                        "value": "En el reino del Metaverso, los sueños se entrelazan,\nDonde los pulsos digitales comienzan a brillar.\nUn universo, etéreo y vasto,\nDonde los avatares bailan y los futuros contrastan.\nMaravillas imaginarias, realidades entrelazadas,\nLa sinfonía del Metaverso, siempre en nuestra mente.",
                    },
                ],
                "nodeId": "v8M2HyqFV_TDsq34nktN3",
                "nodeType": "OutputNode",
            },
        },
    }

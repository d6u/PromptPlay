from sqlalchemy.orm import Session

from .orm.block_set import OrmBlockSet
from .orm.preset import OrmPreset
from .orm.prompt_block import OrmPromptBlock


def previous_block_sets_input_blocks(
    db: Session,
    current_position: int,
    db_preset: OrmPreset,
) -> list[OrmPromptBlock]:
    prompt_blocks: list[OrmPromptBlock] = []

    position = current_position - 1

    block_set = db.scalar(
        db_preset.block_sets.select().filter(OrmBlockSet.position == position)
    )

    while block_set != None:
        # Previous BlockSet must have an outout.
        if block_set.top_output_block == None:
            break

        prompt_blocks.insert(0, block_set.top_output_block)

        # If previous BlockSet output doesn't include input, stop.
        if not block_set.is_output_including_input_blocks:
            break

        # If previous BlockSet output includes input,
        # but it doesn't have an input and it doesn't include previous
        # BlockSet output, stop.
        if (
            block_set.top_input_prompt_block == None
            and not block_set.is_input_including_previous_block_set_output
        ):
            break

        # Include previous BlockSet input if any
        if block_set.top_input_prompt_block != None:
            prompt_blocks.insert(0, block_set.top_input_prompt_block)

        # If previous BlockSet input doesn't include previous previous
        # BlockSet's output, stop
        if not block_set.is_input_including_previous_block_set_output:
            break

        position -= 1

        block_set = db.scalar(
            db_preset.block_sets.select().filter(
                OrmBlockSet.position == position
            )
        )

    return prompt_blocks

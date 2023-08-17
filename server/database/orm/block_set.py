from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from server.database.orm.user import OrmUser

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey
from .completer_block import OrmCompleterBlock
from .preset import OrmPreset
from .prompt_block import OrmPromptBlock


class OrmBlockSet(
    Base,
    MixinUuidPrimaryKey,
    MixinCreatedAt,
    MixinUpdatedAt,
):
    __tablename__ = "block_sets"

    position: Mapped[int] = mapped_column(default=0)
    is_input_including_previous_block_set_output: Mapped[bool] = mapped_column(
        default=True
    )
    is_output_including_input_blocks: Mapped[bool] = mapped_column(
        default=False
    )
    is_repeating_current_block_set: Mapped[bool] = mapped_column(default=False)

    # --- Parents ---

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    owner: Mapped[OrmUser] = relationship(
        foreign_keys=[owner_id],
        back_populates="block_sets",
    )

    preset_id: Mapped[UUID] = mapped_column(
        ForeignKey("presets.id", ondelete="CASCADE"),
        index=True,
    )
    preset: Mapped[OrmPreset] = relationship(
        foreign_keys=[preset_id],
        back_populates="block_sets",
    )

    # --- Peer ---

    # --- input_prompt_block ---
    top_input_prompt_block_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("prompt_blocks.id", ondelete="SET NULL")
    )
    top_input_prompt_block: Mapped[OrmPromptBlock | None] = relationship(
        foreign_keys=[top_input_prompt_block_id],
        lazy="joined",
    )

    # --- system_prompt_block ---
    system_prompt_block_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("prompt_blocks.id", ondelete="SET NULL")
    )
    system_prompt_block: Mapped[OrmPromptBlock | None] = relationship(
        foreign_keys=[system_prompt_block_id],
        lazy="joined",
    )

    # --- completer_block ---
    completer_block_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("completer_blocks.id", ondelete="SET NULL")
    )
    completer_block: Mapped[OrmCompleterBlock | None] = relationship(
        foreign_keys=[completer_block_id],
        lazy="joined",
    )

    # --- output_block ---
    top_output_block_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("prompt_blocks.id", ondelete="SET NULL")
    )
    top_output_block: Mapped[OrmPromptBlock | None] = relationship(
        foreign_keys=[top_output_block_id],
        lazy="joined",
    )

from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, WriteOnlyMapped, mapped_column, relationship

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey
from .user import OrmUser

if TYPE_CHECKING:
    from .completer_block import OrmCompleterBlock
    from .preset import OrmPreset
    from .prompt_block import OrmPromptBlock


class OrmWorkspace(
    Base,
    MixinUuidPrimaryKey,
    MixinCreatedAt,
    MixinUpdatedAt,
):
    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(default="Untitled workspace")

    # --- Parent ---

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    owner: Mapped[OrmUser] = relationship(
        foreign_keys=[owner_id],
        back_populates="workspaces",
    )

    # --- Children ---

    presets: WriteOnlyMapped[OrmPreset] = relationship(
        back_populates="workspace",
        cascade="all, delete",
        passive_deletes=True,
    )
    completer_blocks: WriteOnlyMapped[OrmCompleterBlock] = relationship(
        back_populates="workspace",
        cascade="all, delete",
        passive_deletes=True,
    )
    prompt_blocks: WriteOnlyMapped[OrmPromptBlock] = relationship(
        back_populates="workspace",
        cascade="all, delete",
        passive_deletes=True,
    )

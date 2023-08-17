from __future__ import annotations

from enum import auto
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from strenum import LowercaseStrEnum

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey
from .user import OrmUser
from .workspace import OrmWorkspace


class OrmPromptType(LowercaseStrEnum):
    System = auto()
    User = auto()
    Assistant = auto()


class OrmPromptBlock(
    Base,
    MixinUuidPrimaryKey,
    MixinCreatedAt,
    MixinUpdatedAt,
):
    __tablename__ = "prompt_blocks"

    role: Mapped[OrmPromptType] = mapped_column(default=OrmPromptType.User)
    content: Mapped[str] = mapped_column(default="")

    # --- Parent ---

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    owner: Mapped[OrmUser] = relationship(
        foreign_keys=[owner_id],
        back_populates="prompt_blocks",
    )

    workspace_id: Mapped[UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
    )
    workspace: Mapped[OrmWorkspace] = relationship(
        foreign_keys=[workspace_id],
        back_populates="prompt_blocks",
    )

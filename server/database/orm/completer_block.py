from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey
from .user import OrmUser
from .workspace import OrmWorkspace


class OrmCompleterBlock(
    Base,
    MixinUuidPrimaryKey,
    MixinCreatedAt,
    MixinUpdatedAt,
):
    __tablename__ = "completer_blocks"

    model: Mapped[str] = mapped_column(default="gpt-3.5-turbo")
    temperature: Mapped[float] = mapped_column(default=1.0)
    stop: Mapped[str] = mapped_column(default="")

    # --- Parent ---

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    owner: Mapped[OrmUser] = relationship(
        foreign_keys=[owner_id],
        back_populates="completer_blocks",
    )

    workspace_id: Mapped[UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
    )
    workspace: Mapped[OrmWorkspace] = relationship(
        foreign_keys=[workspace_id],
        back_populates="completer_blocks",
    )

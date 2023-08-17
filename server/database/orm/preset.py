from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, WriteOnlyMapped, mapped_column, relationship

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey
from .user import OrmUser
from .workspace import OrmWorkspace

if TYPE_CHECKING:
    from .block_set import OrmBlockSet


class OrmPreset(
    Base,
    MixinUuidPrimaryKey,
    MixinCreatedAt,
    MixinUpdatedAt,
):
    __tablename__ = "presets"

    name: Mapped[str] = mapped_column(default="Untitled preset")

    # --- Parent ---

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    owner: Mapped[OrmUser] = relationship(
        foreign_keys=[owner_id],
        back_populates="presets",
    )

    workspace_id: Mapped[UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
    )
    workspace: Mapped[OrmWorkspace] = relationship(
        foreign_keys=[workspace_id],
        back_populates="presets",
    )

    # --- Children ---

    block_sets: WriteOnlyMapped[OrmBlockSet] = relationship(
        back_populates="preset",
        cascade="all, delete",
    )

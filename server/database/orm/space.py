from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey
from .user import OrmUser


class OrmSpace(
    Base,
    MixinUuidPrimaryKey,
    MixinCreatedAt,
    MixinUpdatedAt,
):
    __tablename__ = "spaces"

    name: Mapped[str] = mapped_column(default="Untitled space")
    content_version: Mapped[str | None] = mapped_column(default="v2")
    content: Mapped[dict[str, Any] | None] = mapped_column(type_=JSONB)
    flow_content: Mapped[dict[str, Any] | None] = mapped_column(type_=JSONB)

    # --- Parent ---

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    owner: Mapped[OrmUser] = relationship(
        foreign_keys=[owner_id],
        back_populates="spaces",
    )

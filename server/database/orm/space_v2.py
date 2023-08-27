from __future__ import annotations

from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import Mapped, WriteOnlyMapped, mapped_column, relationship

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey
from .user import OrmUser

if TYPE_CHECKING:
    from .completer_block import OrmCompleterBlock
    from .preset import OrmPreset
    from .prompt_block import OrmPromptBlock


class OrmSpaceV2(
    Base,
    MixinUuidPrimaryKey,
    MixinCreatedAt,
    MixinUpdatedAt,
):
    __tablename__ = "spaces_v2"

    name: Mapped[str] = mapped_column(default="Untitled workspace")
    content: Mapped[dict[str, Any] | None] = mapped_column(type_=JSONB)

    # --- Parent ---

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    owner: Mapped[OrmUser] = relationship(
        foreign_keys=[owner_id],
        back_populates="spaces_v2",
    )

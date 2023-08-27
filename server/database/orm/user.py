from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, WriteOnlyMapped, mapped_column, relationship

from ..database import Base
from ..mixins import MixinCreatedAt, MixinUpdatedAt, MixinUuidPrimaryKey

if TYPE_CHECKING:
    from .block_set import OrmBlockSet
    from .completer_block import OrmCompleterBlock
    from .preset import OrmPreset
    from .prompt_block import OrmPromptBlock
    from .space import OrmSpace
    from .workspace import OrmWorkspace


class OrmUser(Base, MixinUuidPrimaryKey, MixinCreatedAt, MixinUpdatedAt):
    __tablename__ = "users"

    is_user_placeholder: Mapped[bool]

    auth0_user_id: Mapped[str | None] = mapped_column(index=True)
    name: Mapped[str | None]
    email: Mapped[str | None]

    placeholder_client_token: Mapped[str | None] = mapped_column(index=True)

    # --- Children ---

    workspaces: WriteOnlyMapped[OrmWorkspace] = relationship(
        back_populates="owner",
        cascade="all, delete",
        passive_deletes=True,
    )
    presets: WriteOnlyMapped[OrmPreset] = relationship(
        back_populates="owner",
        cascade="all, delete",
        passive_deletes=True,
    )
    block_sets: WriteOnlyMapped[OrmBlockSet] = relationship(
        back_populates="owner",
        cascade="all, delete",
        passive_deletes=True,
    )
    prompt_blocks: WriteOnlyMapped[OrmPromptBlock] = relationship(
        back_populates="owner",
        cascade="all, delete",
        passive_deletes=True,
    )
    completer_blocks: WriteOnlyMapped[OrmCompleterBlock] = relationship(
        back_populates="owner",
        cascade="all, delete",
        passive_deletes=True,
    )
    spaces: WriteOnlyMapped[OrmSpace] = relationship(
        back_populates="owner",
        cascade="all, delete",
        passive_deletes=True,
    )

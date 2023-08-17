import uuid
from datetime import datetime

from sqlalchemy import DateTime, FetchedValue, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column


class MixinUuidPrimaryKey:
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), default=uuid.uuid4, primary_key=True
    )


class MixinCreatedAt:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(),
        default=func.now(),
        server_default=FetchedValue(),
    )


class MixinUpdatedAt:
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(),
        default=func.now(),
        server_default=FetchedValue(),
        onupdate=func.now(),
    )

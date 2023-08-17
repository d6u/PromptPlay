from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from server.settings import settings

_user = settings.postgres_user
_pass = settings.postgres_password
_host = settings.postgres_host
_port = settings.postgres_port
_database_name = settings.postgres_database_name

engine = create_engine(
    f"postgresql://{_user}:{_pass}@{_host}:{_port}/{_database_name}",
    echo=True,
)


SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Base(DeclarativeBase):
    pass

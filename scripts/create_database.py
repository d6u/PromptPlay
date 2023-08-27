from sqlalchemy_utils import create_database, database_exists

import server.database.orm
from server.database.database import Base, engine

if not database_exists(engine.url):
    create_database(engine.url)

Base.metadata.create_all(bind=engine)

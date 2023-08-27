from sqlalchemy_utils import create_database, database_exists

import server.database.orm
from server.database.database import Base, engine

if database_exists(engine.url):
    Base.metadata.drop_all(bind=engine)

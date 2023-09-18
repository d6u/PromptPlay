import time

import strawberry
from fastapi import Depends
from sqlalchemy.orm import Session
from strawberry.fastapi import GraphQLRouter

from server.database.database import get_db

from .context import Context
from .mutations.mutation import Mutation
from .query import Query

schema = strawberry.Schema(query=Query, mutation=Mutation)


def measure():
    tic = time.perf_counter()
    try:
        yield
    finally:
        toc = time.perf_counter()
        print(f"Finished in {toc - tic:0.4f} seconds")


async def get_context(
    db: Session = Depends(get_db),
    ignored=Depends(measure),
) -> Context:
    return Context(db=db)


graphql_router = GraphQLRouter(schema, context_getter=get_context)

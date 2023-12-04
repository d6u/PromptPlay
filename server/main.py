from pprint import PrettyPrinter
from typing import cast

from fastapi import Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from server.auth import create_logout_url_with_id_token, oauth
from server.database.database import engine, get_db
from server.database.orm.user import OrmUser
from server.graphql import graphql
from server.settings import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_allow_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key,
    max_age=60 * 60 * 24 * 30,  # 30 days in seconds
)

app.include_router(graphql.graphql_router, prefix="/graphql")


@app.get("/health")
def health() -> str:
    engine.connect()
    return "OK"


@app.get("/hello")
def hello(
    request: Request,
    db: Session = Depends(get_db),
) -> str:
    session_user: dict | None = request.session.get("user", None)

    if session_user == None:
        print("session_user is None")
        return "Hello, World!"

    db_user_id = session_user.get("db_user_id", None)

    if db_user_id == None:
        print("db_user_id is None")
        return "Hello, World!"

    db_user = db.scalar(select(OrmUser).where(OrmUser.id == db_user_id))

    if db_user == None:
        print("db_user is None")
        return "Hello, World!"

    return f"Hello, World! {db_user.name}"


@app.get("/login")
async def login(request: Request):
    return await oauth.auth0.authorize_redirect(
        request, settings.auth_callback_url
    )


@app.get("/auth")
async def auth(
    request: Request,
    db: Session = Depends(get_db),
):
    try:
        token = await oauth.auth0.authorize_access_token(request)
    except Exception as exception:
        print(exception)
        return Response(status_code=500)

    userinfo = cast(dict | None, token["userinfo"])
    id_token = cast(dict | None, token["id_token"])

    pp = PrettyPrinter(indent=2)
    pp.pprint(token)

    if userinfo == None:
        print("userinfo should not be None")
        return Response(status_code=500)

    if id_token == None:
        print("id_token should not be None")
        return Response(status_code=500)

    userinfo_sub = cast(dict | None, userinfo.get("sub", None))
    userinfo_name = cast(dict | None, userinfo.get("name", None))
    userinfo_email = cast(dict | None, userinfo.get("email", None))
    userinfo_picture = cast(dict | None, userinfo.get("picture", None))

    if userinfo_sub == None:
        print("sub key is missing")
        return Response(status_code=500)

    db_user = db.scalar(
        select(OrmUser).where(OrmUser.auth0_user_id == userinfo_sub)
    )

    is_new_user = False

    if db_user == None:
        is_new_user = True

        db_user = OrmUser(
            is_user_placeholder=False,
            auth0_user_id=userinfo_sub,
            name=userinfo_name,
            email=userinfo_email,
            profile_picture_url=userinfo_picture,
        )

        db.add_all([db_user])
    else:
        db_user.name = userinfo_name
        db_user.email = userinfo_email
        db_user.profile_picture_url = userinfo_picture

    db.commit()

    request.session["user"] = {
        "db_user_id": str(db_user.id),
        "id_token": id_token,
    }

    if is_new_user:
        return RedirectResponse(
            url=settings.auth_finish_redirect_url + "?new_user=true"
        )
    else:
        return RedirectResponse(url=settings.auth_finish_redirect_url)


@app.get("/logout")
async def logout(request: Request):
    id_token = cast(
        str | None, request.session.get("user", {}).get("id_token", None)
    )

    # Logout locally

    request.session.clear()

    # Logout from Auth0

    if id_token == None:
        print("sid is missing from session")
        return RedirectResponse(url=settings.auth_finish_redirect_url)

    logout_url = create_logout_url_with_id_token(id_token=id_token)

    return RedirectResponse(url=logout_url)

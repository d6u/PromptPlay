import urllib.parse

from authlib.integrations.starlette_client import OAuth

from server.settings import settings

oauth = OAuth()

oauth.register(
    "auth0",
    client_id=settings.auth0_client_id,
    client_secret=settings.auth0_client_secret,
    server_metadata_url=f"https://{settings.auth0_domain}/.well-known/openid-configuration",
    client_kwargs={"scope": "openid profile email"},
)


# See The OpenID specs
# https://openid.net/specs/openid-connect-rpinitiated-1_0.html#RPLogout
# or the Auth0 documentation on how to logout
# https://auth0.com/docs/authenticate/login/logout/log-users-out-of-auth0
#
# Using "id_token_hint" is recommended by the OpenID specs

LOGOUT_BASE_URL = f"https://{settings.auth0_domain}/oidc/logout?"


def create_logout_url(sid: str) -> str:
    params = {
        "post_logout_redirect_uri": settings.auth_finish_redirect_url,
        "clientId": settings.auth0_client_id,
        "logout_hint": sid,
    }
    return LOGOUT_BASE_URL + urllib.parse.urlencode(params)


def create_logout_url_with_id_token(id_token: str) -> str:
    params = {
        "post_logout_redirect_uri": settings.auth_finish_redirect_url,
        "id_token_hint": id_token,
    }
    return LOGOUT_BASE_URL + urllib.parse.urlencode(params)

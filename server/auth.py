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


def create_logout_url(sid: str) -> str:
    return f"https://{settings.auth0_domain}/oidc/logout?clientId={settings.auth0_client_id}&logout_hint={sid}&post_logout_redirect_uri={settings.auth_finish_redirect_url}"

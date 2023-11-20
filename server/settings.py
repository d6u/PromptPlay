from pydantic import BaseSettings


class Settings(BaseSettings):
    postgres_host: str
    postgres_port: str
    postgres_user: str
    postgres_password: str
    postgres_database_name: str
    auth0_client_id: str
    auth0_client_secret: str
    auth0_domain: str
    auth_finish_redirect_url: str
    cors_allow_origins: str
    session_secret_key: str
    auth_callback_url: str

    class Config:
        # `.env.local` takes priority over `.env`
        env_file = ".env", ".env.local"

    def get_cors_allow_origins_list(self):
        return self.cors_allow_origins.split(",")


settings = Settings()

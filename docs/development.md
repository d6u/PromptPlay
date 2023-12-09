# Development

## Set Up The Environment

Make sure you already have Node.js 18 and Docker installed.

## Set Up Artifacts

Create `./.environments/dev-local/api-server.env` file with the following content:

```txt
DYNAMODB_TABLE_NAME_USERS=dev_users
DYNAMODB_TABLE_NAME_SPACES=dev_spaces
DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS=dev_csv-evaluation-presets
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH_CALLBACK_URL=http://localhost:8000/auth
AUTH_LOGIN_FINISH_REDIRECT_URL=http://localhost:3000
AUTH_LOGOUT_FINISH_REDIRECT_URL=http://localhost:3000
SESSION_COOKIE_SECRET=

# Dev only, used when running on out side of docker
DEV_DYNAMODB_ENDPOINT=http://localhost:8000
```

Create `.environments/vite-dev/.env` file with the following content:

```txt
VITE_IS_LOGIN_ENABLED=true
VITE_API_SERVER_BASE_URL=http://localhost:5050
VITE_POSTHOG_TOKEN=
```

## How Environment Variables Are Loaded

|             | With Docker Compose Locally  | On Host Machine Directly | In Production                 |
| ----------- | ---------------------------- | ------------------------ | ----------------------------- |
| aws_sam_app | Use `--env-file .env` option | `dotenv -e .env`         | Set env var on AWS resources  |
| front       | N/A                          | `dotenv -e .env`         | `dotenv -e .env` during build |
| scripts     | N/A                          | `dotenv -e .env`         | `dotenv -e .env`              |

## Option 1: With Docker Compose Locally

1. Start Docker Compose watch process:

   ```sh
   docker compose --env-file .environments/api-dev-local/api-server.env watch --no-up
   ```

   Separately, start Docker containers:

   ```sh
   docker compose --env-file .environments/api-dev-local/api-server.env up
   ```

2. Create tables if needed:

   ```sh
   dotenv -e .environments/api-dev-local/api-server.env ts-node scripts/dynamodb/create-tables.ts
   ```

   Delete tables if needed:

   ```sh
   dotenv -e .environments/api-dev-local/api-server.env ts-node scripts/dynamodb/delete-tables.ts
   ```

3. (Optional) Visit backend server at [localhost:5050/graphql](http://localhost:5050/graphql).

4. Start frontend dev server. In `front/`:

   ```sh
   npm run dev
   ```

## Option 2: On Host Machine Directly

In `aws_sam_app/server_nodejs/`:

```sh
dotenv -e .environments/api-dev-local/api-server.env nodemon
```

# Deprecated Steps

## Set up the environment

Make sure you already have Python 3.11, Node.js LTS, and Docker installed.

1.  Create Python virtual environment:
    ```sh
    python3 -m venv venv
    ```
2.  Activate the virtual environment and install Python dependencies:
    ```sh
    source venv/bin/activate
    pip install -r requirements.txt
    ```
3.  Install Node.js dependencies in the root directory:
    ```sh
    npm i
    ```
4.  Install Node.js dependencies in the `front` directory:
    ```sh
    cd front
    npm i
    ```
5.  Create local environment file.

    Duplicate `.env` and rename it to `.env.local`:

    ```sh
    cp .env.local .env
    ```

    Add these content to the file

    ```sh
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=example
    POSTGRES_DATABASE_NAME=promptplay-dev
    AUTH0_DOMAIN=
    AUTH0_CLIENT_ID=
    AUTH0_CLIENT_SECRET=
    AUTH_CALLBACK_URL=http://localhost:8000/auth
    AUTH_FINISH_REDIRECT_URL=http://localhost:3000
    CORS_ALLOW_ORIGIN=http://localhost:3000
    SESSION_SECRET_KEY=
    ```

    - You will have to register an Auth0 account and create an application to get the `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET` values.
    - `SESSION_SECRET_KEY` can be anything you want.

## Make sure local database has up to date schema

1. Make sure virtual environment is activated:
   ```sh
   source venv/bin/activate
   ```
2. Start Docker containers:
   ```sh
   docker-compose up
   ```
3. Create the database for the first time:
   ```sh
   (set -a && source .env.local && set +a && PYTHONPATH=. python scripts/create_database.py)
   ```

## Run the app

1. Make sure virtual environment is activated:
   ```sh
   source venv/bin/activate
   ```
2. Run the app:

   ```sh
   ./dev.sh
   ```

   This script will do four things:

   1. Run `docker-compose up`.
   2. Start the backend server with `uvicorn`.
   3. Start Vite dev server for the frontend.
   4. Start GraphQL codegen watcher for the frontend.

3. Open [localhost:3000](http://localhost:3000) in your browser.

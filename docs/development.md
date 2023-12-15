# Development

## Set Up The Environment

Make sure you already have Node.js 18 and Docker installed.

## Set Up Artifacts

1. Create `.environments/api-server/local.env` file with the following content:

   ```txt
   AUTH0_DOMAIN=
   AUTH0_CLIENT_ID=
   AUTH0_CLIENT_SECRET=
   AUTH_CALLBACK_URL=http://localhost:5050/auth
   AUTH_LOGIN_FINISH_REDIRECT_URL=http://localhost:3000
   AUTH_LOGOUT_FINISH_REDIRECT_URL=http://localhost:3000
   SESSION_COOKIE_SECRET=
   ```

2. Create `.environments/dynamodb/local.env` file:

   ```txt
   DYNAMODB_TABLE_NAME_USERS=dev_users
   DYNAMODB_TABLE_NAME_SPACES=dev_spaces
   DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS=dev_csv-evaluation-presets

   # Dev only, don't specify in production
   DEV_DYNAMODB_ENDPOINT=http://localhost:8000
   ```

3. Create `.environments/vite/.env.development` file:

   ```txt
   VITE_IS_LOGIN_ENABLED=true
   VITE_API_SERVER_BASE_URL=http://localhost:5050
   VITE_POSTHOG_TOKEN=
   ```

## How Environment Variables Are Loaded

|                         | With `docker compose` Locally | On Host Machine Directly | In Production                 |
| ----------------------- | ----------------------------- | ------------------------ | ----------------------------- |
| aws_sam_app             | Use `--env-file .env` option  | `dotenv -e .env`         | Set env var on AWS resources  |
| front                   | N/A                           | `dotenv -e .env`         | `dotenv -e .env` during build |
| front > graphql-codegen | N/A                           | `dotenv -e .env`         | N/A                           |
| scripts                 | N/A                           | `dotenv -e .env`         | `dotenv -e .env`              |

## Option 1: With Docker Compose Locally

_Run commands in repository root directory, unless otherwise specified._

1. Start Docker Compose watch process:

   ```sh
   docker compose \
     --env-file .environments/api-server/local.env \
     --env-file .environments/dynamodb/local.env \
     up
   ```

   - Apply `--build` when package has changed.

2. Create tables if needed:

   ```sh
   dotenv -e .environments/api-server/local.env \
     -e .environments/dynamodb/local.env \
     ts-node scripts/dynamodb/create-tables.ts
   ```

   Delete tables if needed:

   ```sh
   dotenv -e .environments/api-server/local.env \
     -e .environments/dynamodb/local.env \
     ts-node scripts/dynamodb/delete-tables.ts
   ```

3. (Optional) Confirm backend server is running at [localhost:5050/hello](http://localhost:5050/hello).

4. (Optional) Generate GraphQL code for front end:

   ```sh
   dotenv -e .environments/vite/.env.development \
     -- pnpm -F front exec graphql-codegen
   ```

5. Start frontend dev server:

   ```sh
   pnpm -F front run dev
   ```

   Pick up a different environment file using mode:

   ```sh
   pnpm -F front run dev -m development-python
   ```

   This requires matching `.env` file in `.environments/vite/`, e.g. `.environments/vite/.env.development-python`.

   - `-m`: Vite mode. This determines which `.env` file to use.

## Option 2: On Host Machine Directly

_Run commands in repository root directory._

```sh
dotenv \
  -e .environments/api-server/local.env \
  -e .environments/dynamodb/local.env \
  -- pnpm -F server_nodejs exec nodemon -e ts --exec ts-node src/index.ts
```

- `--`: Pass command to `dotenv`.
- `--filter server_nodejs`: Run `pnpm` in `server_nodejs` package's context.
- `exec`: I.e. `pnpm exec` that picks up `nodemon` from `server_nodejs` package's `node_modules/.bin`.

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

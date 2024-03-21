# Backend

## Development Workflow

### Start Backend Resources in Docker

In repo root:

```sh
docker compose \
  --env-file .environments/api-server/local.env \
  --env-file .environments/dynamodb/local.env \
  up
```

If you want to start the API server as well

```sh
docker compose \
  --env-file .environments/api-server/local.env \
  --env-file .environments/dynamodb/local.env \
  up --profile api-server
```

### Start API Server on Host Machine (without Docker)

_Need to stast backend resources in Docker first._

In repo root:

```sh
pnpm exec dotenv \
  -e .environments/api-server/local.env \
  -e .environments/dynamodb/local.env \
  -e .environments/postgresql/dev.env \
  -- pnpm -F server_nodejs exec nodemon -e ts --exec pnpm run node-ts src/index.ts
```

## Known Issues

### Why not use `"type": "module"` in `package.json`

This is due to `@mobily/ts-belt` being a Common JS module plus how `exports` and `main` properties in its `package.json` are defined. They causing wired issue when combined with TypeScript and ts-node.

If we remove `@mobily/ts-belt`, we should be able to be unblocked to adopt `"type": "module"` in `package.json`.

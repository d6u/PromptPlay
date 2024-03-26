```sh
pnpm exec dotenv \
  -e .environments/dynamodb/prod.env \
  -e .environments/postgresql/prod.env \
  -- pnpm -F scripts run node-ts seed.ts
```

# Database Models

## Workflow

**Run all commands in repo root, unless otherwise specified.**

### Create a migration based on changes in schema file and re-generate Prisma client

```sh
pnpm exec dotenv \
  -e .environments/postgresql/dev.env \
  -- pnpm -F database-models exec prisma migrate dev
```

### Apply pending migrations to the database in production/staging

```sh
pnpm exec dotenv \
  -e .environments/postgresql/prod.env \
  -- pnpm -F database-models exec prisma migrate deploy
```

## Useful SQL commands

### List all enums

```sql
select n.nspname as enum_schema,
       t.typname as enum_name,
       e.enumlabel as enum_value
from pg_type t
  join pg_enum e on t.oid = e.enumtypid
  join pg_catalog.pg_namespace n ON n.oid = t.typnamespace;
```

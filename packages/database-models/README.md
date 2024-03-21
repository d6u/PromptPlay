# Database Models

## Apply migrations and generate Prisma client

In repo root:

```sh
pnpm exec dotenv \
  -e .environments/postgresql/dev.env \
  -- pnpm -F database-models exec prisma migrate dev
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

## Create Tables

```sh
ts-node -r dotenv/config scripts/dynamodb/create-tables.ts dotenv_config_path=.env
```

- `-r dotenv/config`: Equivalent to write `import "dotenv/config"` in code.
- `dotenv_config_path=.env`: Specify the path to .env file to load.
  If ignored, .env file will be used.

Other options:

```sh
DEBUG=1 ...
```

- `DEBUG=1`: Print all environment variables at program start.

## Delete Tables

```sh
ts-node -r dotenv/config scripts/dynamodb/delete-tables.ts dotenv_config_path=.env
```

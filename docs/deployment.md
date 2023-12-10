# Deployment

## Create the DynamoDB Instance

```sh
dotenv \
  -e .environments/dynamodb/prod.env \
  ts-node scripts/dynamodb/create-tables.ts
```

## Deploy Serverless App

```sh
TODO
```

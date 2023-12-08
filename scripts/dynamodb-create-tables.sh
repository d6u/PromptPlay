#!/bin/bash

aws --no-cli-pager --endpoint-url http://localhost:8000 \
  dynamodb create-table \
  --table-name Users_dev \
  --attribute-definitions \
  AttributeName=Id,AttributeType=S \
  AttributeName=PlaceholderClientToken,AttributeType=S \
  --key-schema \
  AttributeName=Id,KeyType=HASH \
  --global-secondary-indexes \
  IndexName=PlaceholderClientTokenIndex,KeySchema=[\{AttributeName=PlaceholderClientToken,KeyType=HASH\}],Projection=\{ProjectionType=KEYS_ONLY\} \
  --billing-mode PAY_PER_REQUEST

aws --no-cli-pager --endpoint-url http://localhost:8000 \
  dynamodb create-table \
  --table-name Spaces_dev \
  --attribute-definitions \
  AttributeName=Id,AttributeType=S \
  AttributeName=OwnerId,AttributeType=S \
  --key-schema \
  AttributeName=Id,KeyType=HASH \
  --global-secondary-indexes \
  IndexName=OwnerIdIndex,KeySchema=[\{AttributeName=OwnerId,KeyType=HASH\},\{AttributeName=Id,KeyType=RANGE\}],Projection=\{ProjectionType=ALL\} \
  --billing-mode PAY_PER_REQUEST

aws --no-cli-pager --endpoint-url http://localhost:8000 \
  dynamodb create-table \
  --table-name CsvEvaluationPresets_dev \
  --attribute-definitions \
  AttributeName=Id,AttributeType=S \
  AttributeName=SpaceId,AttributeType=S \
  AttributeName=OwnerId,AttributeType=S \
  --key-schema \
  AttributeName=Id,KeyType=HASH \
  --global-secondary-indexes \
  IndexName=SpaceIdIndex,KeySchema=[\{AttributeName=SpaceId,KeyType=HASH\},\{AttributeName=Id,KeyType=RANGE\}],Projection=\{ProjectionType=INCLUDE,NonKeyAttributes=[Name]\} \
  IndexName=OwnerIdIndex,KeySchema=[\{AttributeName=OwnerId,KeyType=HASH\},\{AttributeName=Id,KeyType=RANGE\}],Projection=\{ProjectionType=INCLUDE,NonKeyAttributes=[Name]\} \
  --billing-mode PAY_PER_REQUEST

aws --no-cli-pager --endpoint-url http://localhost:8000 \
  dynamodb list-tables

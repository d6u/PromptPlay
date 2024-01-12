#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

pushd server_nodejs

IMAGE_VERSION_NUMBER=$(awk -F'v' '/v/ {print $2}' ../SERVERLESS_FUNCTION_IMAGE_VERSION)
IMAGE_VERSION_NUMBER=$((IMAGE_VERSION_NUMBER + 1))

sam build --parameter-overrides ServerlessFunctionImageVersion=v$IMAGE_VERSION_NUMBER

printf v$IMAGE_VERSION_NUMBER >../SERVERLESS_FUNCTION_IMAGE_VERSION

sam deploy --stack-name $STACK_NAME \
  --resolve-image-repos \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --confirm-changeset \
  --parameter-overrides \
  ServerlessFunctionImageVersion=v$IMAGE_VERSION_NUMBER \
  ApiSubDomainName=$API_SUB_DOMAIN_NAME \
  HostedZoneId=$HOSTED_ZONE_ID \
  DynamodbTableNameUsers=$DYNAMODB_TABLE_NAME_USERS \
  DynamodbTableNamePlaceholderUsers=$DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS \
  DynamodbTableNameSpaces=$DYNAMODB_TABLE_NAME_SPACES \
  DynamodbTableNameCsvEvaluationPresets=$DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS \
  DynamodbTableNameSessions=$DYNAMODB_TABLE_NAME_SESSIONS \
  CorsAllowedOrigins=$CORS_ALLOWED_ORIGINS \
  Auth0Domain=$AUTH0_DOMAIN \
  Auth0ClientId=$AUTH0_CLIENT_ID \
  Auth0ClientSecret=$AUTH0_CLIENT_SECRET \
  AuthCallbackUrl=$AUTH_CALLBACK_URL \
  AuthLoginFinishRedirectUrl=$AUTH_LOGIN_FINISH_REDIRECT_URL \
  AuthLogoutFinishRedirectUrl=$AUTH_LOGOUT_FINISH_REDIRECT_URL \
  SessionCookieSecret=$SESSION_COOKIE_SECRET

popd

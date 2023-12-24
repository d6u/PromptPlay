#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

pushd front

printf "\n>>> Refreshing dependencies for front...\n"
rm -rfv dist | sed 's/\([^/]*\)\/.*$/\1/' | sort | uniq

pnpm version major

printf "\n>>> Bundling and deploying the front...\n"
pnpm run build -m $VITE_MODE_NAME
aws s3 sync dist s3://cloudfront-$FRONTEND_DOMAIN_NAME-frontend \
  --exclude "*.DS_Store" \
  --delete

popd

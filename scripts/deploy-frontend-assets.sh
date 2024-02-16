#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

no_bump_version=false

# Loop through all the positional parameters
while [[ $# -gt 0 ]]; do
  case $1 in
  --no-bump)
    no_bump_version=true
    shift # Remove --no-bump from processing
    ;;
  *) # Unknown option
    echo "Unknown option: $1"
    exit 1
    ;;
  esac
done

pushd front

printf "\n>>> Refreshing dependencies for front...\n"
rm -rfv dist | sed 's/\([^/]*\)\/.*$/\1/' | sort | uniq

if ! $no_bump_version; then
  echo "Bumping front package version..."
  pnpm version major
fi

printf "\n>>> Bundling and deploying the front...\n"
pnpm run build -m $VITE_MODE_NAME
aws s3 sync dist s3://cloudfront-$FRONTEND_DOMAIN_NAME-frontend \
  --exclude "*.DS_Store" \
  --delete

popd

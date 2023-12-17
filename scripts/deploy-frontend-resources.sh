#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

pushd front

sam build

sam deploy --stack-name $STACK_NAME \
  --resolve-s3 \
  --confirm-changeset \
  --parameter-overrides \
  FrontendDomainName=$FRONTEND_DOMAIN_NAME \
  CloudFrontOriginAccessControlConfigName=$CLOUD_FRONT_ORIGIN_ACCESS_CONTROL_CONFIG_NAME \
  AcmCertificateDomainArn=$ACM_CERTIFICATE_DOMAIN_ARN \
  HostedZoneName=$HOSTED_ZONE_NAME

popd

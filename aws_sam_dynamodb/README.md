## Steps

1. Build SAM templates

   ```sh
   sam build
   ```

2. Deploy SAM templates

   ```sh
   sam deploy --stack-name Promptplay-DynamoDB-dev \
     --resolve-s3 \
     --confirm-changeset \
     --parameter-overrides \
       TableNameUsers=Promptplay_Users_dev \
       TableNameSpaces=Promptplay_Spaces_dev
   ```

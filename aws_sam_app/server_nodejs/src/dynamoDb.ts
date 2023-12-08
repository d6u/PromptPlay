import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import AWSXRay from "aws-xray-sdk";

const config: DynamoDBClientConfig = {
  region: "us-west-2",
};

if (process.env.DEV_DYANMODB_ENDPOINT) {
  console.log("Using DynamoDB endpoint: " + process.env.DEV_DYANMODB_ENDPOINT);
  config.endpoint = process.env.DEV_DYANMODB_ENDPOINT;
}

let dynamoDbClient = new DynamoDBClient(config);

// For AWS environment
if (process.env.LAMBDA_TASK_ROOT) {
  dynamoDbClient = AWSXRay.captureAWSv3Client(dynamoDbClient);
}

export default dynamoDbClient;

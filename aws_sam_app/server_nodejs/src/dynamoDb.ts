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

if (process.env.LAMBDA_TASK_ROOT) {
  // True when running in Lambda docker container
  dynamoDbClient = AWSXRay.captureAWSv3Client(dynamoDbClient);
}

export default dynamoDbClient;

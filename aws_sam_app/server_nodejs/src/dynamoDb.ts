import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import AWSXRay from "aws-xray-sdk";

let dynamoDbClient = new DynamoDBClient({
  region: "us-west-2",
});

// For AWS environment
if (process.env.LAMBDA_TASK_ROOT) {
  dynamoDbClient = AWSXRay.captureAWSv3Client(dynamoDbClient);
}

export default dynamoDbClient;

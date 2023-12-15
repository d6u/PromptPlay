import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import AWSXRay from "aws-xray-sdk";

const config: DynamoDBClientConfig = {
  region: "us-west-2",
};

if (process.env.DEV_DYNAMODB_ENDPOINT) {
  console.log("Using DynamoDB endpoint: " + process.env.DEV_DYNAMODB_ENDPOINT);
  config.endpoint = process.env.DEV_DYNAMODB_ENDPOINT;
}

let dynamoDbClient = new DynamoDBClient(config);

if (process.env.LAMBDA_TASK_ROOT) {
  // True when running in Lambda docker container
  dynamoDbClient = AWSXRay.captureAWSv3Client(dynamoDbClient);
}

export default dynamoDbClient;

export const DocumentClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false,
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true,
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    // Whether to return numbers as a string instead of converting them to
    // native JavaScript numbers.
    wrapNumbers: false,
  },
});

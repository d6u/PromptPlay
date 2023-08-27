import boto3

client = boto3.client("dynamodb", endpoint_url="http://localhost:9000")

table = client.list_tables()

# {
#     "TableNames": [],
#     "ResponseMetadata": {
#         "RequestId": "f486624c-79ac-4e05-ba8b-6fcaac1df43b",
#         "HTTPStatusCode": 200,
#         "HTTPHeaders": {
#             "date": "Sun, 20 Aug 2023 19:00:20 GMT",
#             "x-amzn-requestid": "f486624c-79ac-4e05-ba8b-6fcaac1df43b",
#             "content-type": "application/x-amz-json-1.0",
#             "x-amz-crc32": "1315925753",
#             "content-length": "17",
#             "server": "Jetty(11.0.11)",
#         },
#         "RetryAttempts": 0,
#     },
# }

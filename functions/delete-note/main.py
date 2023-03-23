import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30142625")

def lambda_handler(event, context):
    email = event["email"]
    id = event["id"]
    response = table.delete_item(
        Key={
            "email": email,
            "id": id
        }
    )
    status_code = response['ResponseMetadata']['HTTPStatusCode']
    print(status_code)

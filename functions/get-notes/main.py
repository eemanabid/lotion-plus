# add your get-notes function here
import boto3
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30142625")

def lambda_handler(event, context):
    print(event)
    email = event["queryStringParameters"]["email"]
    response = table.query(
        KeyConditionExpression=Key("email").eq(email)
    )
    items = response["Items"]
    if (len(items) != 0):
        return items
    else:
        return []

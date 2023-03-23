import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30142625")

def lambda_handler(event, context):
    print(event)
    email = event['email']
    id = event['id']
    
    return table.delete_item(
        Key={
            "email": email,
            "id": id,
        }
    )

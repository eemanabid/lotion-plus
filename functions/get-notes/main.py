# add your get-notes function here
import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30142625")

#def get_item(event, context):
 #   print(event)
  #  email = event['email']
   # id = event['id']
    #response = table.get_item(
     #   Key={
      #      "email": email,
       #     "id": id
        #}
    #)
    #item = response["Item"]
    #return item


def lambda_handler(event, context):
    print(event)
    email = event['email']
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("email").eq(email)
    )
    items = response["Items"]
    return items

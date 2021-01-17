import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as path from 'path';


export class StunningGarbanzoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    //Dynamo DB table def
    const table = new dynamodb.Table(this, "Hello", {
      partitionKey: { name: "name", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    const dynamoLambda = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "function.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName
      }
    });


    //Not sure why this cant be done 
    table.grantReadWriteData(dynamoLambda);

    //create the api gateway to serve the lambda
    const api = new apigw.RestApi(this, 'hello-api');

    //Create the resources for the api
    api.root
      .resourceForPath('hello')
      .addMethod("GET", new apigw.LambdaIntegration(dynamoLambda));

    //Creates CFN output, mostly just for CLI usage for now
    new cdk.CfnOutput(this, 'HTTP API URL', {
      value: api.url ?? "Something went wrong"
    });


  }
}

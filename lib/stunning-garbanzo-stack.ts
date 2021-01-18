import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as nodelambda from '@aws-cdk/aws-lambda-nodejs';
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

    const nslamb = new nodelambda.NodejsFunction(this, 'ts-handler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      bundling: {
        minify: true, // minify code, defaults to false
        sourceMap: true, // include source map, defaults to false
        target: 'es2020', // target environment for the generated JavaScript code
      },
      handler: 'tshandler'
    })

    const dynamoLambda = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "function.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName
      }
    });


    //Database perms to the lambda
    table.grantReadWriteData(dynamoLambda);

    //create the api gateway to serve the lambda
    const api = new apigw.RestApi(this, 'hello-api');
    const key = api.addApiKey('ApiKey');

    //Intergration types - Plain js with api akey and ts lambda with no auth
    const authIntergration = new apigw.LambdaIntegration(dynamoLambda);
    const openIntergration = new apigw.LambdaIntegration(nslamb);

    let hello = api.root.resourceForPath('hello');
    let helloMethod = hello.addMethod("GET", authIntergration, { apiKeyRequired: true })

    let tshello = api.root.resourceForPath('tshello');
    let tshelloMethod = tshello.addMethod('GET', openIntergration)

    const plan = api.addUsagePlan('HelloUsagePlan', {
      name: 'HelloKey',
      apiKey: key,
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      },
    });
    plan.addApiStage({
      stage: api.deploymentStage,
      throttle: [
        {
          method: helloMethod,
          throttle: {
            rateLimit: 10,
            burstLimit: 2
          }
        }
      ]
    });

    //Create the resources for the api

    //Creates CFN output, mostly just for CLI usage for now
    new cdk.CfnOutput(this, 'HTTP API URL', {
      value: api.url ?? "Something went wrong"
    });

  }
}

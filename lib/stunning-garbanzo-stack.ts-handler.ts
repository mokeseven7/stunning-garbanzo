import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";



export const tshandler = async function (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            message: 'Go Typescript!',
            input: event
        })
    }
}

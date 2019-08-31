const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    /**
     * Funcion que retorna la estructura de errores requerida por API Gateway al clente
     * */
    var errorResponse = (errorMessage, awsRequestId) => {
        return {
            statusCode: 500,
            body: JSON.stringify({
                Error: errorMessage,
                Reference: awsRequestId,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        }
    }
    
    /**
     * Funcion que retorna la estructura de respuestas ok requerida por API Gateway al cliente
     * */
    var okResponse = (payload) => {
        return {
            statusCode: 201,
            body: JSON.stringify(payload),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        }
    }
    
    var toUrlString = (buffer) => {
        return buffer.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    
    
    if (!event.requestContext.authorizer) {
      callback(null, errorResponse('Authorization not configured', context.awsRequestId));
      return;
    }

    const noteid = toUrlString(randomBytes(16));
    console.log('Received event (', noteid, '): ', event);

    // Debido a que estamos usando Cognito User Pools authorizer, todas nuestras peticiones
    // incluyen en el token de autenticacion al interior del request conext
    // el username y otros atributos extras.
    const username = event.requestContext.authorizer.claims['cognito:username'];

    // El body en una integracion de API Gateway proxy es un string.
    // De manera de extraer su informacion y valores, necesitamos convertir esta informacion
    // a un objeto. en una implementacion mas robusta, quizas sea bueno inspeccionar el header Content-Type
    // diferentes estrategias de parseado del payload.
    const requestBody = JSON.parse(event.body);

    const annotation = requestBody.annotation;
    
    try{
        /**
         * Llamamos a la operacion del SDK de DynamoDB para crear una nueva entrada
         * */
        let datetime = new Date().toISOString();
        let result = await ddb.put({
            TableName: 'MyNotesWebApp',
            Item: {
                userid: username,
                noteid: noteid,
                annotation: annotation,
                save_at: datetime,
            }
        }).promise();
        
        console.log('result', JSON.stringify(result, null, 2));
        /**
         * Devolvemos la respuesta al front llamando al calback con la funcion de okResponse
         * 
         * */
        callback(null, okResponse({requestid: context.awsRequestId, noteid: noteid, save_at: datetime}))
        return;
        
        
    }catch(e){
        console.error(JSON.stringify(e, null, 2));
        callback(null, errorResponse(e.message, context.awsRequestId))
    }

};
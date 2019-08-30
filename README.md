## Serverless Web Application Workshop

En este workshop desplegarás una aplicación web simple que permite a los usuarios autenticar y agregar registros a una base de datos desde un formulario HTML con peticiones ajax a API Gateway.

La arquitectura de la aplicación usa [AWS Lambda][lambda], [Amazon API Gateway][api-gw], [Amazon S3][s3], [Amazon DynamoDB][dynamodb], [Amazon Cognito][cognito], and [AWS Amplify Console][amplify-console]. La consola de Amplify hospeda recursos web estáticos incluyendo HTML, CSS, JavaScript e imagenes, archivos que son cargados en el browser del usuario desde S3. El JavaScript ejecutado en el browser envía y recibe datos desde un backend público que consta de una API construida usando Lambda y API Gateway. Amazon Cognito provee las funciones de administración de usuarios y autenticación para asegurar el backend. Finalmente, DynamoDB provee la capa de persistencia de datos donde esta puede ser almacenada por la API's usando Lambda.

### Pre-requisitos

:white_check_mark: Revisar las siguientes indicaciones en [la guia de configuracion de pre-requisitos][setup],
donde podrás configurar tu entorno de desarrollo AWS Cloud9 IDE

Ver el diagrama abajo para una representación completa de la architectura

![Mis textos](images/wildrydes-complete-architecture.png)

### Módulos

Este workshop esta divido en cuatro modulos, cada modulo describe un escenario de
lo que vamos a construir con instrucciones paso a paso para ayudarte a implementar
la arquitectura y verificar el trabajo.


| Module | Description |
| ---------------- | -------------------------------------------------------- |
| [Static Web hosting][static-web-hosting] | Desplegar un sitio web estático usando la consola de Amplify creando primero un repositorio *git* (ya sea en CodeCommit o GitHub) y luego enviando el código fuente del sitio. |
| [User Management][user-management] | Configurar la administración de usuarios para el sitio web usando Amazon Cognito. |
| [Serverless Backend][serverless-backend] | Crear una funciona lambda que almacene los datos en una tabla Amazon DynamoDB. |
| [RESTful APIs][restful-apis] | Exponer la función lambda via Amazon API Gateway como una API RESTful que pueda ser llamada por el sitio web usando Javascript. |

:warning: Estos modulos deben ser executados de forma secuencial.


[wildrydes]: http://wildrydes.com/
[unicorns]: http://www.wildrydes.com/unicorns.html
[amplify-console]: https://aws.amazon.com/amplify/console/
[cognito]: https://aws.amazon.com/cognito/
[lambda]: https://aws.amazon.com/lambda/
[api-gw]: https://aws.amazon.com/api-gateway/
[s3]: https://aws.amazon.com/s3/
[dynamodb]: https://aws.amazon.com/dynamodb/
[setup]: 0_Setup/
[static-web-hosting]: 1_StaticWebHosting/
[user-management]: 2_UserManagement/
[serverless-backend]: 3_ServerlessBackend/
[restful-apis]: 4_RESTfulAPIs/
[cleanup]: 9_CleanUp/

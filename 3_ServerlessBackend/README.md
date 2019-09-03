# Módulo 3: Servicio Backend Serverless

En este módulo vas a usar [AWS Lambda][lambda] y [Amazon DynamoDB][dynamodb] para construir el servicio backend que recibirá las peticiones desde tu aplicación web. La aplicación ejecutada en el browser que desplegaste en el primer módulo, permite a los usuarios registrar mensajes y/o notas en una base de datos. De manera de cumplir con ese proposito, el Javascript corriendo en el navegador necesita llamar al servicio corriendo en la nube.  

Implementarás una función lambda que será ejecutada cada vez que un usuario registre una anotación, la función recibirá el texto y lo guardará en la tabla DynamoDB para luego responder a la aplicación cliente en front-end con los detalles de la operación.

![Serverless backend architecture](../images/serverless-backend-architecture.png)

La función es invocada desde el navegador usando [Amazon API Gateway][api-gw]. Implementarás esa conexión en el siguiente módulo, para el actual módulo, solo probarás tu función de forma aislada.

## Instrucciones para la implementación

:heavy_exclamation_mark: Asegurate de haber completado los pasos de [User Management][user-management] antes de comenzar con este módulo.

Cada una de las siguientes secciones entrega una descripción general de la implementacion e instrucciones paso a paso. La descripción general deberia proveer suficiente contexto para que puedas completar la implementación si es que ya estas familiarizado con la consola de administración de AWS o si es que quieres explorar en los servicios por tu cuenta sin seguir la guía.

### 1. Crear una tabla Amazon DynamoDB

Use la consola de Amazon DynamoDB para crear una nueva tabla de DynamoDB, a tu tabla ponle el nombre `MyNotesWebApp`, en la llave de partición escribe `userid`, haz click en **Add sort key** y luego escribe `noteid` para el indice de ordenamiento. Toma en cuenta que el nombre de la tabla y los campos son **case sensitive**. Intenta usar exactamente los mismos valores entregados.
Finalmente, desmarca la opcion **Use default settings**, y en las configuraciones que aparecen, haz click en **On-demand**, de esta forma no tendremos que provisionar operaciones de escritura/lectura para esta tabla.

Luego que la tabla está creada, toma nota del ARN para usarlo en el siguiente paso.
After you've created the table, note the ARN for use in the next step.

**:white_check_mark: Instrucciones paso a paso**
1. Navega hasta la [Consola de Amazon DynamoDB][dynamodb-console]
1. Haz click en **Create table**.
1. Escribe `MyNotesWebApp` para el campo **Table name**. Debes usar exactamente el mismo valor entregado debido a que este campo es **case sensitive**.
1. Esribe `userid` en el campo **Partition key** y selecciona **String** para el **key type**. este campo es **case sensitive**.
1. Haz click en **Add sort key** y en el campo que aparece escribe `noteid`. recuerda usar el mismo valor dado que también es **case sensitive**
1. Desmarca la opcion **Use default settings**
1. En la sección de opciones que aparecen, haz click en **On-demand** y luego presiona **Create**.
    ![Create table screenshot](../images/ddb-create-table.png)
1. En la página de detalles, ve al final y encuentra el **ARN** de tu tabla. Usarás este valor en el siguiente paso.

### 2. Crear un IAM Role para tu función Lambda

#### Background

Cada funcion Lambda tiene asociado consigo un IAM rol. Este rol define a que otros servicios de AWS esta función tendrá acceso. Para los propósitos de este workshop, necesitaras crear un IAM rol que autorice a la funcion Lambda para escribir en Amazon CloudWatch Logs y a escribir registros en la tabla de DynamoDB que acabamos de crear.

#### Instrucciones para la implementación

Use la consola web de IAM para crear un nuevo rol, como nombre escriba `MyNotesWebAppLambda` y luego selecciona **AWS Lambda** para el **role type**. necesitaras adjuntar políticas que entreguen a la función los permisos necesarios para escribir en Amazon CloudWatch Logs y para escribir registros en tu tabla de DynamoDB.

Adjunta la **managed policy** de nombre `AWSLambdaBasicExecutionRole` a este rol para entregar los permisos necesarios para escribir en CloudWatch Logs, También, deberas crear una **custom inline policy** en tu rol, que permita la accion `ddb:PutItem` en la tabla que acabamos de crear en el paso anterior.

**:white_check_mark: Instrucciones paso a paso**
1. Navega hasta la [Consola web de AWS IAM][iam-console]
1. Selecciona **Roles** en la barra de navegación al costado izquiero y luego haz click en **Create role**.
1. Selecciona **Lambda** para el **role type** desde el grupo **AWS service**, luego haz click en **Next: Permissions**
    **Nota:** Seleccionando el **role type** automáticamente genera un **trust policy** que permite a los servicios de AWS asumir este rol por ti. Si crearas este rol usando el CLI, AWS CloudFormation u otro mecanismo, tendrás que especificar esta política diréctamente.
1. Comienza escribiendo `AWSLambdaBasicExecutionRole` en el cuadro de texto **Filter** y selecciona el rol que aparece marcando el cuadro.
1. Haz click en **Next: Tags**. Agrega todos los tags que quieras.
1. Luego haz click en **Next: Review**.
1. Escribe el nombre `MyNotesWebAppLambda` en el campo **Role name**.
1. Finalmente haz click en **Create role**. 

Lo siguiente que debes hacer, es agregar permisos para que el rol pueda acceder a la tabla de DynamoDB

**:white_check_mark: Instrucciones paso a paso*
1. Mientras estás en la consola de IAM, escribe `MyNotesWebAppLambda` en el cuadro de texto para filtrar y selecciona el rol que acabas de crear.
1. En la pestaña de **Permissions**, haz click en el link **Add inline policy** para crear un nuevo **inline policy**.
    ![Inline policies screenshot](../images/inline-policies.png)
1. Selecciona **Choose a service**.
1. Comienza a escribir `DynamoDB` en el cuadro de busquedas llamado **Find a service** y selecciona **DynamoDB** cuando aparezca.
    ![Select policy service](../images/select-policy-service.png)
1. Haz click en **Select actions**.
1. Comienza escribiendo `PutItem` en el cuadro de texto llamado **Filter actions** y selecciona el cuadro junto a **PutItem** cuando aparezca.
1. Haz click en la sección **Resources**.
1. Con la opción **Specific** seleccionada, haz click sobre el link, **Add ARN** en la sección **table**.
1. Pega el ARN de la tabla que haz creado en el paso anterior en el campo **Specify ARN for table**, y luego haz click en **Add**.
1. Haz click en **Review Policy**.
1. Escribe `DynamoDBWriteAccess` para el nombre de esta política y luego haz click en **Create policy**.
    ![Review Policy](../images/review-policy.png)

### 3. Crea una función Lambda para procesar las peticiones

#### Background

AWS Lambda ejecutará tu código fuente en respuesta a eventos tales como **peticiones HTTP**. En este paso, construirás la función principal que procesará las peticiones que llegan a nuestra API desde la aplicación web para guardar la nota de texto. En el siguiente módulo usarás API Gateway para crear una API RESTful que expondrá un endpoint HTTP que puede ser invocado por los usuarios desde el navegador. Finalmente conectarás con la función Lambda que crearás en este paso a esa API de manera de crear un backend totalmente funcional para tu aplicación.

#### Instrucciones para la implementación

Utiliza la consola de AWS Lambda para crear una nueva funcion llamada `SaveAnnotation` que procesará las peticiones que llegan a nuestr API. utiliza este script de ejemplo [saveAnnotation.js](saveAnnotation.js) como código fuente para tu función, Solo copia y pega el contenido del archivo en el editor de la consola web de AWS Lambda.

Asegurate de configurar tu función para usar el IAM rol `MyNotesWebAppLambda` que haz creado en el paso anterior.

**:white_check_mark: Instrucciones paso a paso**
1. Navega a la consola web de [AWS Lambda][lambda-console]
1. Haz click en **Create function**.
1. Mantén la opción por defecto **Author from scratch** que debería estar seleccionada.
1. Escribe `SaveAnnotation` en el campo **Name**.
1. Selecciona **Node.js 10.x** como **Runtime**.
2. Haz click en *Choose or create an execution role* que se encuentra bajo **Permissions** para desplegar mas opciones.
1. Asegurate de seleccionar `Choose an existing role` en el menu desplegable **Role**.
1. Seleciona `MyNotesWebAppLambda` en el menú desplegable **Existing Role**.
    ![Create Lambda function screenshot](../images/create-lambda-function.png)
1. Haz click en **Create function**.
1. Baja en la página hasta encontrar la sección **Function code** y reemplaza el código existente en **index.js** usando el editor de código con el contenido de [saveAnnotation.js](saveAnnotation.js).
    ![Create Lambda function screenshot](../images/create-lambda-function-code.png)
1. Haz click en **"Save"** en la esquina superior izquierda de la página.

## Validación de la implementación.

Para este módulo podrás probar la función que acabas de implementar usando la consola web de AWS Lambda. en el siguiente módulo agregarás una API REST para que puedas invocar tu función desde la aplicación que corre en el navegador y que desplegamos en el primer módulo.

**:white_check_mark: Instrucciones paso a paso**
1. Desde la página principal de edición de tu función, selecciona la opcion **Configure test events** desde el menú desplegable **Select a test event...**.
    ![Configure test event](../images/configure-test-event.png)
1. Manten la opción **Create new test event** seleccionada.
1. Escribe `TestRequestEvent` en el campo **Event name**
1. Copia y pega el siguiente evento de prueba en el editor:
    ```JSON
    {
      "path": "/annotate",
      "httpMethod": "POST",
      "headers": {
        "Accept": "*/*",
        "Authorization": "eyJraWQiOiJLTzRVMWZs",
        "content-type": "application/json; charset=UTF-8"
      },
      "queryStringParameters": null,
      "pathParameters": null,
      "requestContext": {
        "authorizer": {
          "claims": {
            "cognito:username": "the_username"
          }
        }
      },
      "body": "{\"annotation\":\"Mi anotacion de prueba\"}"
    }
    ```
    ![Configure test event](../images/configure-test-event-2.png)
1. Haz click en **Create**.
1. Desde la página principal de edición de tu función, haz click en **Test** con `TestRequestEvent` seleccionado en el menú desplegable.  
1. Ve hasta el comienzo de la pagina y despliega los detalles de la ejecución haciendo click en **Details** de la sección **Execution result**
1. Verificar que la ejecución sea exitosa y que el resultado sea algo como esto:
    ```JSON
    {
        "statusCode": 201,
        "body": "{\"requestid\":\"719b1c33-6e79-4a95-9ce0-9bbdc206dd44\",\"noteid\":\"uNytg7LWlyAAJfgL5h8d3A\",\"save_at\":\"2019-09-03T18:44:10.341Z\"}",
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }
    ```

### :star: Recap

:key: [AWS Lambda][lambda] Es un servicio de ejecución de código serverless is a serverless functions as a service product that removes the burden of managing servers to run your applications. You configure a trigger and set the role that the function can use and then can interface with almost anything you want from databases, to datastores, to other services eithe publicly on the internet or in your own Amazon Virtual Private Cloud (VPC). [Amazon DynamoDB][dynamodb] is a non-relational serverless database that can scale automatically to handle massive amounts of traffic and data without you need manage any servers.

:wrench: In this module you've created a DynamoDB table and then a Lambda function to write data into it. This function will be put behind an Amazon API Gateway in the next module which will in turn be connected to your web application to capture the ride details from your users.

### Next

:white_check_mark: After you have successfully tested your new function using the Lambda console, you can move on to the next module, [RESTful APIs][restful-apis].

[amplify-console]: https://aws.amazon.com/amplify/console/
[cognito]: https://aws.amazon.com/cognito/
[lambda]: https://aws.amazon.com/lambda/
[api-gw]: https://aws.amazon.com/api-gateway/
[dynamodb]: https://aws.amazon.com/dynamodb/
[static-web-hosting]: ../1_StaticWebHosting/
[user-management]: ../2_UserManagement/
[restful-apis]: ../4_RESTfulAPIs/
[dynamodb-console]: https://console.aws.amazon.com/dynamodb/home
[iam-console]: https://console.aws.amazon.com/iam/home
[lambda-console]: https://console.aws.amazon.com/lambda/home
## Setup

### Cuenta de AWS

De manera de completar este workshop, necesitaras una cuenta de AWS y permisos para 
crear recursos tales como AWS Identity and Access Management (IAM), Amazon Cognito, 
AWS Lambda, Amazon S3, Amazon API Gateway, AWS Amplify Console, Amazon DynamoDB y
AWS Cloud9 en esa cuenta

El código y las instrucciones en este workshop asumen que solo un participante
estará usando una cuenta de AWS a la vez, si usted necesita compartir una cuenta 
con otro participante, necesitará resolver el conflicto de nombre para ciertos
recursos. Una alternativa puede ser usando un sufijo en el nombre de los recursos
o quizás usando distintas regiones, pero las instrucciones no proveen detalles
sobre como cambiar lo necesario para hacerlo funcionar bajo esta modalidad.

Preferentemente use una cuenta personal o cree una nueva cuenta para este workshop
en vez de usar la cuenta de una organización para asegurarse de que tiene acceso 
completo a los servicios necesarios para realizar la actividad.

### AWS Cloud9 IDE

AWS Cloud9 es un ambiente de desarrollo integrado basado en la nube, que te permite
escribir, correr y depurar tu código solo usando el browser. Este incluye un editor
de codigo, depurador y terminal. Cloud9 viene pre-cargado con paquetes y herramientas
escenciales para los lenguajes de programación mas populares, así como también tiene
el AWS Command Line Interfase (CLI) ya instalado, de esta forma no tienes que instalar
o configurar nada en tu laptop localmente para este workshop. Tu ambiente de Cloud9 
tendrá acceso a los mismos recursos que el usuario que estes usando en la consola
web de administración de AWS.

Tómate un momento ahora para configurar tu ambiente de desarrollo Cloud9.

**:white_check_mark: Instrucciones Paso a Paso**

1. Anda a la consola web de administracion de AWS, click en **Services** luego selecciona **Cloud9**
   bajo el grupo **Developer Tools**.

1. Click en **Create environment**.

1. Escribe `Development` en **Name** y opcionalmente provee una descripción en **Description**.

1. Click en **Next step**.

1. Puedes dejar los **Environment settings** por defecto para lanzar una nueva
   instancia EC2 **t2.micro** la cual sera pausada despues de **30 minutos** de
   inactividad.

1. Click en **Next step**.

1. Revisa las configuraciones del ambiente y haz click en **Create environment**. esto
   tomará algunos minutos para que el servicio pueda provisionar y preparar el entorno.

1. Una vez listo, tu IDE abrirá una ventana de **Bienvenida**. Bajo esta, deberias poder
   ver la terminal.

    Puedes correr ahí comandos de AWS CLI tal como si se tratara de tu computadora local.
    Verifica que tu usuario esta logeado tecleando este comando `aws sts get-caller-identity`.

    ```console
    aws sts get-caller-identity
    ```

    You'll see output indicating your account and user information:

    ```console
    ec2-user:~/environment $ aws sts get-caller-identity
    ```
    ```json
    {
        "Account": "123456789012",
        "UserId": "AKIAI44QH8DHBEXAMPLE",
        "Arn": "arn:aws:iam::123456789012:user/Alice"
    }
    ```

Manten abierto tu IDE AWS Cloud9 en una pestaña durante este workshop

### :star: Tips

:bulb: Manten abierto alguna pestaña de Cloud9 o un editor de texto en tu equipo local
para tomar notas. Cuando los paso a paso te digan que tomes nota de algo como un ID o
un Amazon Resource Name (ARN), copia y pega esta informacion en el editor que escojas.

### :star: Recap

:key: Use una única [cuenta de AWS](#aws-account) ya sea personal o de desarrollo

:key: Mantenga su [AWS Cloud9 IDE](#aws-cloud9-ide) abierto durante todo el workshop

### Next

:white_check_mark: Ahora proceda con el primer módulo, [Static Web Hosting][static-web-hosting], 
donde desplegarás un sitio web estático usando la consola de AWS Amplify.

[region-table]: https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/
[static-web-hosting]: ../1_StaticWebHosting/
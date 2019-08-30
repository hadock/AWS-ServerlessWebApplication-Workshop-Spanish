/*global _config AmazonCognitoIdentity AWSCognito*/

/**
 * Esta es una variable a nivel del browser para la ventana.
 * Si esta es cerrada, esta varianle se destruye.
 * 
 * */

/**
 * Esta instruccion se ejecuta cuando el documento HTML esta 
 * completamente cargado en el browser
 * 
 * */
$(document).ready( () => {
    /**
     * Estos son los parametros necesarios para inicializar AmazonCognitoIdentity.CognitoUserPool
     * Los datos provienen del archivo de configuracion ubicado en /js/config.js
     * 
     * */
    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };
    
    /**
     * Si los datos de configuracion para cognito no estan establecidos en /js/config.js
     * Desplegamos una alerta diciendo que estos no estan definidos
     * 
     * */
    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        alert("Este modulo no ha sido configurado completamente para permitir la autenticacion");
        return;
    }
    
    /**
     * Inicializando el pool de usuarios con la configuracion
     * que apunta a nuestro pool de cognito
     * 
     * */
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    /**
     * Verificando que la libreria de cognito este incluida en el HTML
     * */
    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }else{
        console.log('Libreria de AWSCognito no esta presente');
    }
    
    /**
     * Funcion para reemplazar el @ por un -at- y de esa forma poder usarlo
     * como username en Cognito
     * */
    var toUsername = (email) => {
        return email.replace('@', '-at-');
    };
    
    var verify = async (email, code) => {
        
        /**
         * Con esta llamada, indicamos el usuario y el pool de usuarios donde debemos buscar
         * */
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool
        });
        
        /**
         * Confirmando la registracion del usuario mediante una promesa
         * debido a que necesitamos esperar la respuesta de la operacion
         * 
         * */
        return new Promise( (resolve, reject) => {
            try{
                cognitoUser.confirmRegistration(code, true, (err, result) => {
                    if (!err) { resolve(result);} 
                    else { reject(err); }
                });
            }catch(e){
                console.error('confirmRegistration', JSON.stringify(e));
                reject(e);
            }
        });
            
    }
    
    $('#verifyForm').submit( async () => {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        try{
            var result = await verify(email, code); 
            console.log('verification-success', JSON.stringify(result, null, 2));
            alert('Verificacion del correo exitosa');
            
        }catch(e){
            console.error('verification-error', JSON.stringify(e, null, 2));
            alert(e);
        }
         
    });
    
});
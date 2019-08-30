/*global $ _config AmazonCognitoIdentity AWSCognito*/
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
        alert("Este modulo no ha sido configurado completamente para permitir el uso de Cognito");
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
    
    /**
     * Funcion que realizará el registro
     * Esta funcion retorna un promesa
     * 
     * */
    var register = async (email, password) => {
        var attributes = [];
        
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        
        /**
         * Agregamos los atributos que queremos asociar a este usuario
         * */
        attributes.push(new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail));
        
        /**
         * Le decimos a cognito que ejecute el registro y lo ponemos
         * al interior de una promesa para poder esperar su respuesta
         * */
        return new Promise( (resolve, reject) => {
            try{
                userPool.signUp(toUsername(email), password, attributes, null,
                    (err, result) => {
                        if (!err) { resolve(result);} 
                        else { reject(err);}
                    }
                );
            }catch(e){
                reject(e);
            }
        });

    }
    
    $('#registrationForm').on('submit', async () => {
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();
        
        event.preventDefault();

        if (password === password2) {
            try{
                var result = await register(email, password);
                console.log('ok', JSON.stringify(result, null, 2));
                alert('Se ha enviado un codigo de verificacion a tu correo');
                /**
                 * Aqui hacemos la redireccion al sitio donde realizamos operaciones 
                 * que necesitan una sesion activa.
                 * Como redireccionamos a otro sitio? doc#$%*.hr#% = ""
                 * */
                 
                 
            }catch(e){
                alert(e);
                console.log('failure', JSON.stringify(e, null, 2));
            }
        } else {
            alert('Los passwords no son iguales');
        }
        
        return false;
        
    });
});
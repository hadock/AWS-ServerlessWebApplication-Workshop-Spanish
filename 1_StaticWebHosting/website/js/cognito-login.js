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
    
    /**
     * Funcion para hacer el log-in
     * */
    var login = async (email, password, onSuccess, onFailure) => {
        /**
         * Con esta llamada generamos los datos de autenticacion
         * */
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: toUsername(email),
            Password: password
        });

        /**
         * Con esta llamada, indicamos el usuario y el pool de usuarios donde debemos buscar
         * */
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool
        });
        
        /**
         * Le decimos a cognito que inicie la autenticacion mediante
         * una promesa para poder esperar su respuesta
         * */
        return new Promise( (resolve, reject) => {
            try{
                cognitoUser.authenticateUser(authenticationDetails, {onSuccess: resolve, onFailure: reject});
            }catch(e){
                console.log('login-failed', e);
                reject(e);
            }
        });
        
    };
    
    /**
     * Esta accion nos permite vincular una funcion async al evento click
     * del boton loginButton
     * */
    $('#loginButton').on('click', async (event) => {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        
        try{
            /**
             * Hacemos la llamada a la funcion que ejecuta la autenticacion
             * */
            var result = await login(email, password);
            alert('Autenticacion exitosa');
            
            $('#CognitoResultTXT').val(JSON.stringify(result, null, 2));
            
            /**
             * Aqui hacemos la redireccion al sitio donde realizamos operaciones 
             * que necesitan una sesion activa.
             * Como redireccionamos a otro sitio? doc#$%*.hr#% = ""
             * */
             
             
        }catch(e){
            /**
             * Cualquier error durante la autenticacion caera en el bloque del catch
             * ya sea error de comunicacion o credenciales invalidas
             * 
             * */
            alert('Error en la autenticacion');
            $('#CognitoResultTXT').val(JSON.stringify(e, null, 2));
        }
    } );
    
    
})
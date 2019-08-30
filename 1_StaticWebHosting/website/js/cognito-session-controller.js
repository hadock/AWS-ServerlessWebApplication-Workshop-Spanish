/*global jQuery MiAplicacion _config AmazonCognitoIdentity AWSCognito*/
/**
 * Esta es una variable a nivel del browser para la ventana.
 * Si esta es cerrada, esta varianle se destruye.
 * 
 * */
var MiAplicacion = window.MiAplicacion || {};

/**
 * Esta instruccion se ejecuta cuando el documento HTML esta 
 * completamente cargado en el browser
 * 
 * */
(async function($){
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
        alert("Este modulo no ha sido configurado completamente para permitir el registro, verificacion y autenticacion");
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
     * Funcion que permitira remover la sesion actual
     * 
     * */
    MiAplicacion.signOut = () => {
        userPool.getCurrentUser().signOut();
    };
    
    /**
     * Funcion que permitira obtener el token JWT de la sesion actual
     * siempre y cuando esta sea una sesion valida
     * Lo realizamos al interior de una promesa debido a que debemos esperar su respuesta
     * 
     * */
    MiAplicacion.authToken = new Promise((resolve, reject) => {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession( (err, session) => {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });
    
}(jQuery));
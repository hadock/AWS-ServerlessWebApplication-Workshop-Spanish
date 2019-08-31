/*global jQuery $ MiAplicacion _config*/
var MiAplicacion = window.MiAplicacion || {};

(async function ($) {
    var authToken;
    var session;
    
    try{
        authToken = await MiAplicacion.authToken;
        if(authToken){
            session = await MiAplicacion.getSession;
            $("#username").html(session.username);
            $("#userInfo").show();
            
        }else{
            throw {"message": "No hay sesion activa o no se han completado los modulos anteriores."};
        }
        
    }catch(e){
        alert(JSON.stringify(e));
        console.log('token-error', JSON.stringify(e, null, 2));
        return;
    }
    
    if (!_config.api.invokeUrl) {
        alert("API Gateway no se ha configurado aun");
        return;
    }
    
    /**
     * Esta funcion, arma el request para enviarlo a API Gateway, los parametros de entrada son
     * @var method (String) recurso al cual apuntaremos la llamada 
     * @var payload (Object) datos que estaremos enviando a la API
     * 
     * @returns Promise esta funcion retorna una promesa que puede ser ejecutada con un await
     * */
    var api_request = (method, payload) => {
        /**
         * Usamos $.ajax() de JQuery para realizar el request a API Gateway.
         * En los parametros definimos lo siguiente
         * method: POST <-- indica que API Gateway recibira la peticion en este metodo para el recurso
         * url: String <-- la url de la api + el recurso, para efectos de este workshop es /annotation
         * headers: {} <-- objeto con la cabecera de ida, es aqui donde ponemos el token de autenticación
         * data: String <-- cuerpo del mensaje codificado en string, para enviar un objeto usamos JSON.stringify()
         * contentType: String <-- el tipo de datos que estaremos enviando a API Gateway.
         * */
         
        return $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/' + method,
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify(payload),
            contentType: 'application/json'
        });
            
    }
    
    $('#saveButton').on('click', async (e) => {
        e.preventDefault();
        let txt = $("#annotationTXT").val();
        try{
            //limpiando la caja de texto
            $("#annotationTXT").val("");
            //generando un id temporal para la vista
            var id = "note"+String(new Date().getMilliseconds());
            //agregando el valor a la lista
            $('#updates').append($('<li id="'+id+'">' + txt + '</li>'));
            //enviando el valor a api gateway
            var result = await api_request('annotation', {annotation: txt});
            //poniendo el id resultado de la operacion usando el id temporal
            $('#updates > #'+id).attr('id', result.noteid);
            
            console.log('sucess', JSON.stringify(result, null, 2));
        }catch(e){
            console.error('error', JSON.stringify(e, null, 2));
        }
    });
    
    $('#closeSession').on('click', (e) => {
        MiAplicacion.signOut();
        $('#saveButton').unbind('click');
        $('#userInfo').toggle(500);
    })
    
}(jQuery));
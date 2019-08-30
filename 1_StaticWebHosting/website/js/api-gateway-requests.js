/*global jQuery $ MiAplicacion _config*/
var MiAplicacion = window.MiAplicacion || {};

(async function ($) {
    var authToken;
    try{
        authToken = await MiAplicacion.authToken;
        if(authToken){
            console.log('jwt', authToken);
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
    
    
    var api_request = async (method, payload) => {
        return await $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: 12345,
                    Longitude: 12345
                }
            }),
            contentType: 'application/json',
        });
    }
    
    $('#saveButton').on('click', async (e) => {
        e.preventDefault();
        let txt = $("#txtToSave").val();
        try{
            $('#updates').append($('<li>' + txt + '</li>'));
            var result = api_request('ride', {text: txt});
            console.log('sucess', JSON.stringify(result, null, 2));
        }catch(e){
            console.error('error', JSON.stringify(e, null, 2));
        }
    })
    
}(jQuery));
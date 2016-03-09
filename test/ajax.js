var ajax = function(settings){

    var doRequest = function(resolve, reject){
        var httpRequest = new XMLHttpRequest(),
            data = settings.data,
            dataType = settings.dataType || 'json';

        httpRequest.onreadystatechange = function(){
            if(httpRequest.readyState === 4){

                var responseString = httpRequest.responseText,
                    rtrnData;

                if(dataType === 'json'){
                    try {
                        rtrnData = JSON.parse(responseString);
                    } catch(err){
                        rtrnData = responseString;
                    }
                } else {
                    rtrnData = responseString;
                }

                if(httpRequest.status === 200){
                    if(typeof resolve === 'function'){
                        resolve(rtrnData, httpRequest);
                    }
                } else {
                    if(typeof reject === 'function'){
                        reject(rtrnData, httpRequest);
                    }
                }

            }
        };

        var requestType = settings.type !== undefined ? settings.type.toUpperCase() : 'GET',
            postTypes = ['POST', 'PUT', 'DELETE'];

        httpRequest.open(requestType, settings.url, true);

        if(postTypes.indexOf(requestType) !== -1){
            if(typeof data === 'object'){
                httpRequest.setRequestHeader('Content-Type', 'application/json');
            } else {
                httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
        }

        if(dataType === 'json' && typeof data === 'object' && !Array.isArray(data)){
            data = JSON.stringify(data);
        }

        httpRequest.send(data);
    };

    return new Promise(doRequest);
};

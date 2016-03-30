class ParamParser {
  
    parseEndpointStr(schemaEndpoint, givenParams){
        let paramNames = this._getUrlEndpointParamNames(schemaEndpoint),
            paramsValid = this._validateParams(schemaEndpoint, givenParams, paramNames);

        if(!paramsValid.success){
            //if not success
            //return results directly
            return paramsValid;
        }
    
        let { endpointUrl, queryData } = this._parseEndpointUrl(schemaEndpoint, givenParams, paramNames);
    
        return {
            success: true,
            endpointUrl,
            queryData
        };
    }

    _parseEndpointUrl(schemaEndpoint, givenParams, { url, query }){
        let endpoint = schemaEndpoint;

        //replace all required params {param}
        url.required.forEach(function(name){
            let val = givenParams[name];
            endpoint = endpoint.replace('{'+name+'}', val);
        });

        //replace all optional params {/param}
        url.optional.forEach(function(name){
            let val = givenParams[name];
            if(typeof val !== 'undefined'){
              endpoint = endpoint.replace('{/'+name+'}', '/'+val); 
            } else {
              endpoint = endpoint.replace('{/'+name+'}', '');
            }
        });

        //get all optional query properties
        //and if defined add them to the queryData
        //object
        let queryData = {};
        query.optional.forEach(function(name){
            let val = givenParams[name],
                paramRegex = new RegExp('\{?(\\?|\\,)'+name+'\}?');

            //add to data object, if there is a value for it
            if(typeof val !== 'undefined'){
                queryData[name] = val;
            }

            //remove query param it from the url
            endpoint = endpoint.replace(paramRegex, '');
        });

        return {
            endpointUrl: endpoint,
            queryData: queryData
        };
    }

    _validateParams(schemaEndpoint, givenParams, { url, query }){
      
        //check if all required params are provided
        for(name of url.required){
            if(typeof givenParams[name] === 'undefined'){
                //throw error
                return {
                    success: false,
                    errorType: 'Error',
                    message: 'Param "'+name+'" is required for endpoint '+schemaEndpoint
                };
            }
        }

        //check if there aren't any params that are not needed
        for(let name in givenParams){
            if(url.required.indexOf(name) === -1 &&
                url.optional.indexOf(name) === -1 && 
                query.optional.indexOf(name) === -1){
                //throw error
                return {
                    success: false,
                    errorType: 'Error',
                    message: 'Param "'+name+'" is not not found in the schema for endpoint '+schemaEndpoint
                };
            }
        }
      
        return {
            success: true
        };
    }
  
    _getUrlEndpointParamNames(endpoint){
        //get clean endpoint without protocol
        let cleanEndpoint = endpoint.replace(/http(s)?\:\/\//, ''),
            matches = [];

        //match url and query params
        let requiredUrlParamMatches = endpoint.match(/\/\{([^\/\:\?]+)\}/g) || [],
            optionalUrlParamMatches = endpoint.match(/\{\/([^\{\}\?]+)\}/g) || [],
            optionalQueryParamMatches = endpoint.match(/(\?|\,)([^\,\}]+)/g) || [];
      
        let cleanUrlParam = function(str){
            //remove brackets and first slash in case
            //its an optional url param
            return str.replace(/\{|\}/g, '').replace('/', '');
        };

        //clean url params
        requiredUrlParamMatches = requiredUrlParamMatches.map(cleanUrlParam);
        optionalUrlParamMatches = optionalUrlParamMatches.map(cleanUrlParam);

        //get query param names
        optionalQueryParamMatches = optionalQueryParamMatches.map(function(match){
            return match.replace(/\,|\?/g, '');
        });

        return {
            url: {
                required: requiredUrlParamMatches,
                optional: optionalUrlParamMatches
            },
            query: {
                optional: optionalQueryParamMatches
            }
        };
    }
  
};

export default ParamParser;


import SchemaParser from './SchemaParser'
import ajax from './ajax'

class Schematics {

    constructor(schemaUrl){

        this._publicsMethods = {
            get: function(params, _obj){
                //get endpoint details
                let details = _obj._get;

                //get parsed endpoint url
                let endpointUrl = this._parseEndpointStr(details._cleanHref, params);

                return ajax({
                    url: endpointUrl,
                    dataType: 'json'
                });
            },

            post: function(params, _obj){
                //get endpoint details
                let details = _obj._post;
                let schemaParser = new SchemaParser(details.params);

                return new Promise(function(resolve, reject){
                    schemaParser.checkParamsValid(params, function(result){
                        if(!result.valid){
                            throw new Error(result.message);
                        }

                        ajax({
                            method: 'POST',
                            url: endpointUrl,
                            dataType: 'json'
                        })
                        .then(resolve)
                        .catch(reject);
                    });
                });
            }
        };

        return new Promise((resolve, reject) => {
            this._getSchema(schemaUrl, resolve, reject);
        });
    }

    _getSchema(schemaUrl, resolve, reject){
        ajax({
            url: schemaUrl,
            dataType: 'json'
        })
        .then((schema) => {
            this._storeEndpoints(schema);
            resolve(this, schema);
        })
        .catch(reject);
    }

    _storeEndpoints(endpoints){
        //loop endpoints
        for(let name in endpoints){
            let details = endpoints[name];
      
            //loop request methods
            for(let reqMethod in details){
                let reqMethodDetails = details[reqMethod];
        
                reqMethodDetails._cleanHref = reqMethodDetails.href.replace(/http(s)?\:\/\//, '');
        
                //save details to different location in object
                details['_'+reqMethod] = reqMethodDetails;
        
                //replace method in object with function to use the endpoint
                details[reqMethod] = (params) => this._publicsMethods[reqMethod].apply(this, [params, details]);
            }
      
            this[name] = details;
        }
    }
  
    _parseEndpointStr(endpoint, givenParams){
        let endpointParamNames = this._getUrlEndpointParamNames(endpoint);
    
        //check if all required params are provided
        endpointParamNames.forEach(function(name){
            if(typeof givenParams[name] === 'undefined'){
                //throw error
                throw new Error('Param "'+name+'" is required for endpoint '+endpoint);
            }
        });
    
        //parse endpoint URL
        for(let name in givenParams){
            let val = givenParams[name];
            endpoint = endpoint.replace(':'+name, val);
        }
    
        return endpoint;
    }
  
    _getUrlEndpointParamNames(endpoint, params){
        let matches = endpoint.match(/\:([^\/\:]+)/g) || [];
        matches = matches.map(function(match){
            return match.replace(/\:/g, '');
        });
        return matches
    }
  
};

export default Schematics

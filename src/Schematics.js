import SchemaParser from './SchemaParser'
import ajax from './ajax'

class Schematics {

    constructor(schemaUrl){

        this._publicsMethods = {
            get: function(params, _obj){
                //get endpoint details
                let details = _obj._get;

                //get parsed endpoint url
                let endpointUrl = this._parseEndpointStr(details.href, params);

                return ajax({
                    url: endpointUrl,
                    dataType: 'json'
                });
            },

            post: (params, _obj) => this._doRequestWithParams('post', params, _obj),
            put: (params, _obj) => this._doRequestWithParams('put', params, _obj),
            delete: (params, _obj) => this._doRequestWithParams('delete', params, _obj)
        };

        return new Promise((resolve, reject) => this._getSchema(schemaUrl, resolve, reject));
    }

    _doRequestWithParams(reqName, params, _obj){
        //get endpoint details
        let details = _obj['_'+reqName],
            schemaParser = new SchemaParser(details.params);

        return new Promise(function(resolve, reject){
            schemaParser.checkParamsValid(params, function(result){
                if(!result.valid){
                    throw new Error(result.message);
                }

                ajax({
                    type: reqName,
                    url: details.href,
                    dataType: 'json'
                })
                .then(resolve)
                .catch(reject);
            });
        });
    }

    _getSchema(schemaUrl, resolve, reject){
        ajax({
            url: schemaUrl,
            dataType: 'json'
        })
        .then((schema) => {
            this._storeEndpoints(schema);
            resolve(this);
        })
        .catch(reject);
    }

    _storeEndpoints(endpoints){
        //loop endpoints
        for(let name in endpoints){
            let details = endpoints[name];

            //if details is a string
            //the method is GET and the string is the href
            if(typeof details === 'string'){
                let detailsObj = {},
                    href = details;
                detailsObj._get = { href: href };
                detailsObj.get = (params) => this._publicsMethods.get.apply(this, [params, detailsObj]);
                this[name] = detailsObj;
                continue;
            }
      
            //loop request methods
            for(let reqMethod in details){
                let reqMethodDetails = details[reqMethod];

                //if reqMethodDetails is a string
                //its the href
                if(typeof reqMethodDetails === 'string'){
                    //if the method is get
                    //its okay
                    if(reqMethod === 'get'){
                        let href = reqMethodDetails;
                        details['_'+reqMethod] = { href: href };
                        details[reqMethod] = (params) => this._publicsMethods[reqMethod].apply(this, [params, details]);
                    } else {
                        //if the method is not req
                        //throw an error
                        throw new Error('Expected an Object for method '+reqMethod+', instead found string "'+reqMethodDetails);
                    }
                } else {
                    //if its a normal object with at least a href property
            
                    //save details to different location in object
                    details['_'+reqMethod] = reqMethodDetails;
            
                    //replace method in object with function to use the endpoint
                    details[reqMethod] = (params) => this._publicsMethods[reqMethod].apply(this, [params, details]);
                }
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
        let cleanEndpoint = endpoint.replace(/http(s)?\:\/\//, ''),
            matches = endpoint.match(/\:([^\/\:]+)/g) || [];

        matches = matches.map(function(match){
            return match.replace(/\:/g, '');
        });
        return matches
    }
  
};

export default Schematics

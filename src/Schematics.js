import SchemaParser from './SchemaParser'

let http;

class Schematics {

    constructor(schemaUrl, httpMethod){
        if(typeof schemaUrl !== 'string' || typeof httpMethod !== 'function'){
            throw new Error('Please provide both schema url String and a http method');
        }

        //use the user's http method for requests
        http = httpMethod;

        this._publicsMethods = {
            get: function(params, _obj){
                //get endpoint details
                let details = _obj._get;

                //get parsed endpoint url
                let endpointUrl = this._parseEndpointStr(details.href, params);

                return http({
                    url: endpointUrl
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

                http({
                    type: reqName,
                    url: details.href,
                    data: params
                })
                .then(resolve)
                .catch(reject);
            });
        });
    }

    _getSchema(schemaUrl, resolve, reject){
        http({
            url: schemaUrl
        })
        .then((schema) => {
            let schemaType = typeof schema;

            if(schemaType !== 'object'){
                //not a valid schema
                throw new Error('Thats not a valid schema. Expected type object, got type '+schemaType);
            }

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
        let endpointParamNames = this._getUrlEndpointParamNames(endpoint),
            requiredParamNames = endpointParamNames.required,
            optionalParamNames = endpointParamNames.optional;
    
        //check if all required params are provided
        requiredParamNames.forEach(function(name){
            if(typeof givenParams[name] === 'undefined'){
                //throw error
                throw new Error('Param "'+name+'" is required for endpoint '+endpoint);
            }
        });

        //check if there aren't any params that are not needed
        for(let name in givenParams){
            if(requiredParamNames.indexOf(name) === -1 && optionalParamNames.indexOf(name) === -1){
                //throw error
                throw new Error('Param "'+name+'" is not not found in the schema for endpoint '+endpoint);
            }
        }
    
        //parse endpoint URL
        requiredParamNames.forEach(function(name){
            let val = givenParams[name];
            endpoint = endpoint.replace(':'+name, val);
        });

        optionalParamNames.forEach(function(name){
            let val = givenParams[name],
                paramRegex = new RegExp('(\\?|\\&)'+name);

            if(typeof val !== 'undefined'){
                //if the optional param is given, put it in the URL
                endpoint = endpoint.replace(paramRegex, '$1'+name+'='+val);
            } else {
                //otherwise remove it from the url
                endpoint = endpoint.replace(paramRegex, '');
            }
        });
    
        return endpoint;
    }
  
    _getUrlEndpointParamNames(endpoint, params){
        let cleanEndpoint = endpoint.replace(/http(s)?\:\/\//, ''),
            matches = [],
            requiredParamMatches = endpoint.match(/\:([^\/\:\?]+)/g) || [],
            optionalParamMatches = endpoint.match(/(\?|\&)([^\&]+)/g) || [];

        requiredParamMatches = requiredParamMatches.map(function(match){
            return match.replace(/\:/g, '');
        });

        optionalParamMatches = optionalParamMatches.map(function(match){
            return match.replace(/\&|\?/g, '');
        });

        return {
            required: requiredParamMatches,
            optional: optionalParamMatches
        };
    }
  
};

export default Schematics

import SchemaParser from './SchemaParser.js';

let http;

class Schematics {

    constructor(schemaUrl, httpMethod){
        if(typeof schemaUrl !== 'string' || typeof httpMethod !== 'function'){
            this._throwError('Please provide both a schema url String and a http method');
        }

        //use the user's http method for requests
        http = httpMethod;

        this._publicsMethods = {
            get: function(params, returnFields, _obj){
                //get endpoint details
                let details = _obj._get;

                //get parsed endpoint url
                let result = this._parseEndpointStr(details.href, params);

                if(!result.success){
                    return new Promise((resolve, reject) => {
                        this._rejectPromise(reject, result);
                    });
                } else {
                    //add returnFields if present
                    //that way the server will know
                    //what returnFields to return
                    if(typeof returnFields !== 'undefined'){
                        result.queryData['return_fields[]'] = returnFields;
                    }

                    return http({
                        url: result.endpointUrl,
                        data: result.queryData
                    });
                }
            },

            post: (params, _obj) => this._doRequestWithParams('post', params, _obj),
            put: (params, _obj) => this._doRequestWithParams('put', params, _obj),
            delete: (params, _obj) => this._doRequestWithParams('delete', params, _obj)
        };

        return new Promise((resolve, reject) => this._getSchema(schemaUrl, resolve, reject));
    }

    _throwError(msg){
        let err = new Error(msg);
        if(console && console.error){
            console.error(err);
        } else {
            throw err;
        }
    }

    _rejectPromise(rejectMethod, details){
        let errorDetails = {
            internal: true,
            errorType: details.errorType,
            message: details.message
        };

        if(details.errorType === 'TypeError'){
            errorDetails.expectedType = details.expectedType;
            errorDetails.gotType = details.gotType;
        }

        rejectMethod(errorDetails);
    }

    _doRequestWithParams(reqName, params, _obj){
        //get endpoint details
        let details = _obj['_'+reqName],
            schemaParser = new SchemaParser(details.params);

        return new Promise((resolve, reject) => {
            schemaParser.checkParamsValid(params, (result) => {
                if(!result.valid){
                    this._rejectPromise(reject, result);
                } else {
                    http({
                        type: reqName,
                        url: details.href,
                        data: params
                    })
                    .then(resolve)
                    .catch(reject);
                }
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
                this._rejectPromise(reject, {
                    errorType: 'TypeError',
                    message: 'Thats not a valid schema. Expected type object, got type '+schemaType,
                    expectedType: 'Object',
                    gotType: schemaType
                });
            }

            let details = this._storeEndpoints(schema);
            if(!details.success){
                this._rejectPromise(reject, details);
            } else {
                this.getSchema = () => schema;
                resolve(this);
            }
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
                detailsObj.get = (params, returnFields) => this._publicsMethods.get.apply(this, [params, returnFields, detailsObj]);
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
                        return {
                            success: false,
                            errorType: 'TypeError',
                            message: 'Expected an Object for method '+reqMethod+', instead found string "'+reqMethodDetails,
                            expectedType: 'Object',
                            gotType: 'String'
                        };
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

        return {
            success: true
        };
    }
  
    _parseEndpointStr(endpoint, givenParams){
        let endpointParamNames = this._getUrlEndpointParamNames(endpoint),
            requiredParamNames = endpointParamNames.required,
            optionalParamNames = endpointParamNames.optional;
    
        //check if all required params are provided
        for(let i = 0, l = requiredParamNames.length; i < l; i++){
            let name = requiredParamNames[i];
            if(typeof givenParams[name] === 'undefined'){
                //throw error
                return {
                    success: false,
                    errorType: 'Error',
                    message: 'Param "'+name+'" is required for endpoint '+endpoint
                };
            }
        }

        //check if there aren't any params that are not needed
        for(let name in givenParams){
            if(requiredParamNames.indexOf(name) === -1 && optionalParamNames.indexOf(name) === -1){
                //throw error
                return {
                    success: false,
                    errorType: 'Error',
                    message: 'Param "'+name+'" is not not found in the schema for endpoint '+endpoint
                };
            }
        }
    
        //parse endpoint URL
        requiredParamNames.forEach(function(name){
            let val = givenParams[name];
            endpoint = endpoint.replace(':'+name, val);
        });

        let queryData = {};
        optionalParamNames.forEach(function(name){
            let val = givenParams[name],
                paramRegex = new RegExp('(\\?|\\&)'+name);

            //add to data object, if there is a value for it
            if(typeof val !== 'undefined'){
                queryData[name] = val;
            }

            //remove query param it from the url
            endpoint = endpoint.replace(paramRegex, '');
        });
    
        return {
            success: true,
            endpointUrl: endpoint,
            queryData: queryData
        };
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

export default Schematics;

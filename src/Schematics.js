import SchemaParser from './SchemaParser';
import ParamParser from './ParamParser';

class Schematics {

    constructor(schemaUrlOrGetMethod, httpMethod){
        if((typeof schemaUrlOrGetMethod !== 'string' && typeof schemaUrlOrGetMethod !== 'function') || typeof httpMethod !== 'function'){
            this._throwError('Please provide both a schema url or get method and a http method');
            return;
        }

        //init param parser
        let paramParser = new ParamParser(),
            self = this;

        //use the user's http method for requests
        this._http = httpMethod;

        this._publicsMethods = {
            get: function(params, returnFields, _obj){
                //get endpoint details
                let details = _obj._get;

                //get parsed endpoint url
                let result = paramParser.parseEndpointStr(details.href, params);

                if(!result || !result.success){
                    return new Promise((resolve, reject) => this._rejectPromise(reject, result));
                } else {
                    //add returnFields if present
                    //that way the server will know
                    //what returnFields to return
                    if(typeof returnFields !== 'undefined'){
                        result.queryData['return_fields[]'] = returnFields;
                    }

                    return new Promise((resolve, reject) => {
                        self._http({
                            url: result.endpointUrl,
                            data: result.queryData
                        })
                        .then((body) => this._processGetRes(body, resolve, reject))
                        .catch(reject);
                    });
                }
            },

            post: (params, _obj) => this._doRequestWithParams('post', params, _obj),
            put: (params, _obj) => this._doRequestWithParams('put', params, _obj),
            delete: (params, _obj) => this._doRequestWithParams('delete', params, _obj)
        };

        if(typeof schemaUrlOrGetMethod === 'function'){
            //if schemaUrlOrGetMethod is a function
            //use it to get the intial schema
            return new Promise((resolve, reject) => {
                new Promise((resolve, reject) => {
                    schemaUrlOrGetMethod(resolve, reject, httpMethod);
                })
                .then((body) => this._processGetRes(body, resolve, reject))
                .catch(reject);
            });
        } else {
            //request initial endpoint schema
            //which should contain a valid schema
            return new Promise((resolve, reject) => {
                this._http({
                    url: schemaUrlOrGetMethod
                })
                .then((body) => this._processGetRes(body, resolve, reject))
                .catch(reject);
            });
        }
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

    _processGetRes(body, resolve, reject){
        //check if there is a schema
        if(body && typeof body['$schema'] !== 'undefined'){
            //response contains a schema
            let schema = body['$schema'],
                schemaValid = this._validateSchema(schema);

            //check if schema is valid
            if(!schemaValid){
                 this._rejectPromise(reject, schemaValid.error);
            } else {
                //if schema is valid
                //get api object
                let apiObject = this._constructAPIObject(schema);
                if(!apiObject){
                    this._rejectPromise(reject, details);
                } else {
                    resolve({
                        api: apiObject,
                        body: body
                    });
                }
            }
        } else {
            resolve({
                body: body
            });
        }
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
                    this._http({
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

    _validateSchema(schema){
        let schemaType = typeof schema;

        if(schemaType !== 'object'){
            //not a valid schema
            return {
                success: false,
                error: {
                    errorType: 'TypeError',
                    message: 'Thats not a valid schema. Expected type object, got type '+schemaType,
                    expectedType: 'Object',
                    gotType: schemaType
                }
            };
        } else {
            return true;
        }
    }

    _constructAPIObject(schema){
        let apiObject = {
            getSchema(){
                return schema;
            }
        };

        //loop endpoints
        for(let name in schema){
            let details = schema[name];

            //if details is a string
            //the method is GET and the string is the href
            if(typeof details === 'string'){
                let detailsObj = {},
                    href = details;
                detailsObj._get = { href: href };
                detailsObj.get = (params, returnFields) => this._publicsMethods.get.apply(this, [params, returnFields, detailsObj]);
                apiObject[name] = detailsObj;
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
      
            apiObject[name] = details;
        }

        return apiObject;
    }
  
};

export default Schematics;

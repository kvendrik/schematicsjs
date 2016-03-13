class SchemaParser {
    constructor(schema){
        this._schema = schema;  
        this._typeOptions = ["String", "Number", "Date", "Array", "Object", "Boolean"];
    }

    _getValueType(value){
        var type = {}.toString.call(value);
	   return type.match(/\s(\w+)/)[1];
    }
  
    checkParamsValid(params, callback){
        let schema = this._schema,
            threwError = false;
            self = this;

        let checkSchemaObject = function(schemaObj, paramsObj){
            //loop all properties in object
            for(let key in schemaObj){
        
                //get the schema value, the actual value and the schema type
                let schemaVal = schemaObj[key],
                    paramsVal = paramsObj[key],
                    objType = self._getValueType(schemaVal);
        
                //if not in given params and not optional, throw error
                if(typeof paramsVal === 'undefined' && schemaVal.optional !== true){
                    callback({
                        valid: false,
                        errorType: 'Error',
                        message: 'Param "'+key+'" is required'
                    });
                    threwError = true;
                    return;
                }
        
                //if its an object and has a type option or is a string
                //its a schema object/string
                var isSchema = (objType === 'Object' && typeof schemaVal.type !== 'undefined');
                if(objType === 'String') isSchema = true;
        
                if(isSchema){
                    let validType = (objType === 'String' ? schemaVal : schemaVal.type),
                        actualType = self._getValueType(paramsVal);
          
                    //if the actual type does not match the type
                    //it should be
                    if(actualType !== validType){
                        if(actualType === 'Undefined' && schemaVal.optional === true){
                            //dont throw an error as the value is undefined and optional
                            continue;
                        }
            
                        //value is invalid
                        callback({
                            valid: false,
                            errorType: 'TypeError',
                            message: 'Param "'+key+'" should be of type '+validType,
                            expectedType: validType,
                            gotType: actualType
                        });
                        threwError = true;
                        return;
                    }
                } else {
                    //if its not an object and has no type property and is not a string
                    //its a custom object
                    checkSchemaObject(schemaVal, paramsVal);
                }
            }
        };
    
        checkSchemaObject(schema, params);
        
        if(!threwError){
            callback({
                valid: true
            });
        }
    }
}

export default SchemaParser;

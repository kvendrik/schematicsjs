'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SchemaParser = function () {
    function SchemaParser(schema) {
        _classCallCheck(this, SchemaParser);

        this._schema = schema;
    }

    _createClass(SchemaParser, [{
        key: '_getValueType',
        value: function _getValueType(value) {
            var type = {}.toString.call(value);
            return type.match(/\s(\w+)/)[1];
        }
    }, {
        key: 'checkParamsValid',
        value: function checkParamsValid(params, callback) {
            var schema = this._schema,
                threwError = false;
            self = this;

            var checkSchemaObject = function checkSchemaObject(schemaObj, paramsObj) {
                //loop all properties in object
                for (var key in schemaObj) {

                    //get the schema value, the actual value and the schema type
                    var schemaVal = schemaObj[key],
                        paramsVal = paramsObj[key],
                        objType = self._getValueType(schemaVal);

                    //if not in given params and not optional, throw error
                    if (typeof paramsVal === 'undefined' && schemaVal.optional !== true) {
                        callback({
                            valid: false,
                            errorType: 'Error',
                            message: 'Param "' + key + '" is required'
                        });
                        threwError = true;
                        return;
                    }

                    //if its an object and has a type option or is a string
                    //its a schema object/string
                    var isSchema = objType === 'Object' && typeof schemaVal.type !== 'undefined';
                    if (objType === 'String') isSchema = true;

                    if (isSchema) {
                        var validType = objType === 'String' ? schemaVal : schemaVal.type,
                            actualType = self._getValueType(paramsVal);

                        //if the actual type does not match the type
                        //it should be
                        if (actualType !== validType) {
                            if (actualType === 'Undefined' && schemaVal.optional === true) {
                                //dont throw an error as the value is undefined and optional
                                continue;
                            }

                            //value is invalid
                            callback({
                                valid: false,
                                errorType: 'TypeError',
                                message: 'Param "' + key + '" should be of type ' + validType,
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

            if (!threwError) {
                callback({
                    valid: true
                });
            }
        }
    }]);

    return SchemaParser;
}();

exports.default = SchemaParser;
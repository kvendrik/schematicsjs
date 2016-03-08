(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SchemaParser = function () {
    function SchemaParser(schema) {
        _classCallCheck(this, SchemaParser);

        this._schema = schema;
        this._typeOptions = ["String", "Number", "Date", "Array", "Object", "Boolean"];
    }

    _createClass(SchemaParser, [{
        key: "_getValueType",
        value: function _getValueType(value) {
            var type = {}.toString.call(value);
            return type.match(/\s(\w+)/)[1];
        }
    }, {
        key: "checkParamsValid",
        value: function checkParamsValid(params, callback) {
            var schema = this._schema,
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
                            message: 'Param "' + key + '" is required'
                        });
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
                                message: 'Param "' + key + '" should be of type ' + validType
                            });
                        }
                    } else {
                        //if its not an object and has no type property and is not a string
                        //its a custom object
                        checkSchemaObject(schemaVal, paramsVal);
                    }
                }
            };

            checkSchemaObject(schema, params);
        }
    }]);

    return SchemaParser;
}();

exports.default = SchemaParser;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SchemaParser = require('./SchemaParser');

var _SchemaParser2 = _interopRequireDefault(_SchemaParser);

var _ajax = require('./ajax');

var _ajax2 = _interopRequireDefault(_ajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Schematics = function () {
    function Schematics(schemaUrl) {
        var _this = this;

        _classCallCheck(this, Schematics);

        this._publicsMethods = {
            get: function get(params, _obj) {
                //get endpoint details
                var details = _obj._get;

                //get parsed endpoint url
                var endpointUrl = this._parseEndpointStr(details.href, params);

                return (0, _ajax2.default)({
                    url: endpointUrl,
                    dataType: 'json'
                });
            },

            post: function post(params, _obj) {
                //get endpoint details
                var details = _obj._post;
                var schemaParser = new _SchemaParser2.default(details.params);

                return new Promise(function (resolve, reject) {
                    schemaParser.checkParamsValid(params, function (result) {
                        if (!result.valid) {
                            throw new Error(result.message);
                        }

                        (0, _ajax2.default)({
                            method: 'POST',
                            url: endpointUrl,
                            dataType: 'json'
                        }).then(resolve).catch(reject);
                    });
                });
            }
        };

        return new Promise(function (resolve, reject) {
            _this._getSchema(schemaUrl, resolve, reject);
        });
    }

    _createClass(Schematics, [{
        key: '_getSchema',
        value: function _getSchema(schemaUrl, resolve, reject) {
            var _this2 = this;

            (0, _ajax2.default)({
                url: schemaUrl,
                dataType: 'json'
            }).then(function (schema) {
                _this2._storeEndpoints(schema);
                resolve(_this2);
            }).catch(reject);
        }
    }, {
        key: '_storeEndpoints',
        value: function _storeEndpoints(endpoints) {
            var _this3 = this;

            var _loop = function _loop(name) {
                var details = endpoints[name];

                //if details is a string
                //the method is GET and the string is the href
                if (typeof details === 'string') {
                    var _ret2 = function () {
                        var detailsObj = {},
                            href = details;
                        detailsObj._get = { href: href };
                        detailsObj.get = function (params) {
                            return _this3._publicsMethods.get.apply(_this3, [params, detailsObj]);
                        };
                        _this3[name] = detailsObj;
                        return {
                            v: 'continue'
                        };
                    }();

                    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
                }

                //loop request methods

                var _loop2 = function _loop2(reqMethod) {
                    var reqMethodDetails = details[reqMethod];

                    //if reqMethodDetails is a string
                    //its the href
                    if (typeof reqMethodDetails === 'string') {
                        //if the method is get
                        //its okay
                        if (reqMethod === 'get') {
                            var href = reqMethodDetails;
                            details['_' + reqMethod] = { href: href };
                            details[reqMethod] = function (params) {
                                return _this3._publicsMethods[reqMethod].apply(_this3, [params, details]);
                            };
                        } else {
                            //if the method is not req
                            //throw an error
                            throw new Error('Expected an Object for method ' + reqMethod + ', instead found string "' + reqMethodDetails);
                        }
                    } else {
                        //if its a normal object with at least a href property

                        //save details to different location in object
                        details['_' + reqMethod] = reqMethodDetails;

                        //replace method in object with function to use the endpoint
                        details[reqMethod] = function (params) {
                            return _this3._publicsMethods[reqMethod].apply(_this3, [params, details]);
                        };
                    }
                };

                for (var reqMethod in details) {
                    _loop2(reqMethod);
                }

                _this3[name] = details;
            };

            //loop endpoints
            for (var name in endpoints) {
                var _ret = _loop(name);

                if (_ret === 'continue') continue;
            }
        }
    }, {
        key: '_parseEndpointStr',
        value: function _parseEndpointStr(endpoint, givenParams) {
            var endpointParamNames = this._getUrlEndpointParamNames(endpoint);

            //check if all required params are provided
            endpointParamNames.forEach(function (name) {
                if (typeof givenParams[name] === 'undefined') {
                    //throw error
                    throw new Error('Param "' + name + '" is required for endpoint ' + endpoint);
                }
            });

            //parse endpoint URL
            for (var name in givenParams) {
                var val = givenParams[name];
                endpoint = endpoint.replace(':' + name, val);
            }

            return endpoint;
        }
    }, {
        key: '_getUrlEndpointParamNames',
        value: function _getUrlEndpointParamNames(endpoint, params) {
            var cleanEndpoint = endpoint.replace(/http(s)?\:\/\//, ''),
                matches = endpoint.match(/\:([^\/\:]+)/g) || [];

            matches = matches.map(function (match) {
                return match.replace(/\:/g, '');
            });
            return matches;
        }
    }]);

    return Schematics;
}();

;

exports.default = Schematics;

},{"./SchemaParser":1,"./ajax":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = function (settings) {

    var doRequest = function doRequest(resolve, reject) {
        var httpRequest = new XMLHttpRequest(),
            data = settings.data,
            dataType = settings.dataType;

        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {

                var responseString = httpRequest.responseText,
                    rtrnData;

                if (dataType === 'json') {
                    try {
                        rtrnData = JSON.parse(responseString);
                    } catch (err) {
                        rtrnData = responseString;
                    }
                } else {
                    rtrnData = responseString;
                }

                if (httpRequest.status === 200) {
                    if (typeof resolve === 'function') {
                        resolve(rtrnData, httpRequest);
                    }
                } else {
                    if (typeof reject === 'function') {
                        reject(rtrnData, httpRequest);
                    }
                }
            }
        };

        var requestType = settings.type !== undefined ? settings.type.toUpperCase() : 'GET',
            postTypes = ['POST', 'PUT', 'DELETE'];

        httpRequest.open(requestType, settings.url, true);

        if (postTypes.indexOf(requestType) !== -1) {
            if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
                httpRequest.setRequestHeader('Content-Type', 'application/json');
            } else {
                httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
        }

        if (dataType === 'json' && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && !Array.isArray(data)) {
            data = JSON.stringify(data);
        }

        httpRequest.send(data);
    };

    return new Promise(doRequest);
};

;

},{}],4:[function(require,module,exports){
'use strict';

var _Schematics = require('./Schematics');

var _Schematics2 = _interopRequireDefault(_Schematics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.Schematics = _Schematics2.default;

},{"./Schematics":2}]},{},[4]);

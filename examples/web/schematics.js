/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Schematics = __webpack_require__(1);

	var _Schematics2 = _interopRequireDefault(_Schematics);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (typeof window !== 'undefined') {
	    window.Schematics = _Schematics2.default;
	}

	exports.default = _Schematics2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _SchemaParser = __webpack_require__(2);

	var _SchemaParser2 = _interopRequireDefault(_SchemaParser);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var http = void 0;

	var Schematics = function () {
	    function Schematics(schemaUrl, httpMethod) {
	        var _this2 = this;

	        _classCallCheck(this, Schematics);

	        if (typeof schemaUrl !== 'string' || typeof httpMethod !== 'function') {
	            this._throwError('Please provide both a schema url String and a http method');
	        }

	        //use the user's http method for requests
	        http = httpMethod;

	        this._publicsMethods = {
	            get: function get(params, returnFields, _obj) {
	                var _this = this;

	                //get endpoint details
	                var details = _obj._get;

	                //get parsed endpoint url
	                var result = this._parseEndpointStr(details.href, params);

	                if (!result.success) {
	                    return new Promise(function (resolve, reject) {
	                        _this._rejectPromise(reject, result);
	                    });
	                } else {
	                    //add returnFields if present
	                    //that way the server will know
	                    //what returnFields to return
	                    if (typeof returnFields !== 'undefined') {
	                        result.queryData['return_fields[]'] = returnFields;
	                    }

	                    return http({
	                        url: result.endpointUrl,
	                        data: result.queryData
	                    });
	                }
	            },

	            post: function post(params, _obj) {
	                return _this2._doRequestWithParams('post', params, _obj);
	            },
	            put: function put(params, _obj) {
	                return _this2._doRequestWithParams('put', params, _obj);
	            },
	            delete: function _delete(params, _obj) {
	                return _this2._doRequestWithParams('delete', params, _obj);
	            }
	        };

	        return new Promise(function (resolve, reject) {
	            return _this2._getSchema(schemaUrl, resolve, reject);
	        });
	    }

	    _createClass(Schematics, [{
	        key: '_throwError',
	        value: function _throwError(msg) {
	            var err = new Error(msg);
	            if (console && console.error) {
	                console.error(err);
	            } else {
	                throw err;
	            }
	        }
	    }, {
	        key: '_rejectPromise',
	        value: function _rejectPromise(rejectMethod, details) {
	            var errorDetails = {
	                internal: true,
	                errorType: details.errorType,
	                message: details.message
	            };

	            if (details.errorType === 'TypeError') {
	                errorDetails.expectedType = details.expectedType;
	                errorDetails.gotType = details.gotType;
	            }

	            rejectMethod(errorDetails);
	        }
	    }, {
	        key: '_doRequestWithParams',
	        value: function _doRequestWithParams(reqName, params, _obj) {
	            var _this3 = this;

	            //get endpoint details
	            var details = _obj['_' + reqName],
	                schemaParser = new _SchemaParser2.default(details.params);

	            return new Promise(function (resolve, reject) {
	                schemaParser.checkParamsValid(params, function (result) {
	                    if (!result.valid) {
	                        _this3._rejectPromise(reject, result);
	                    } else {
	                        http({
	                            type: reqName,
	                            url: details.href,
	                            data: params
	                        }).then(resolve).catch(reject);
	                    }
	                });
	            });
	        }
	    }, {
	        key: '_getSchema',
	        value: function _getSchema(schemaUrl, resolve, reject) {
	            var _this4 = this;

	            http({
	                url: schemaUrl
	            }).then(function (schema) {
	                var schemaType = typeof schema === 'undefined' ? 'undefined' : _typeof(schema);

	                if (schemaType !== 'object') {
	                    //not a valid schema
	                    _this4._rejectPromise(reject, {
	                        errorType: 'TypeError',
	                        message: 'Thats not a valid schema. Expected type object, got type ' + schemaType,
	                        expectedType: 'Object',
	                        gotType: schemaType
	                    });
	                }

	                var details = _this4._storeEndpoints(schema);
	                if (!details.success) {
	                    _this4._rejectPromise(reject, details);
	                } else {
	                    _this4.getSchema = function () {
	                        return schema;
	                    };
	                    resolve(_this4);
	                }
	            }).catch(reject);
	        }
	    }, {
	        key: '_storeEndpoints',
	        value: function _storeEndpoints(endpoints) {
	            var _this5 = this;

	            var _loop = function _loop(name) {
	                var details = endpoints[name];

	                //if details is a string
	                //the method is GET and the string is the href
	                if (typeof details === 'string') {
	                    var _ret2 = function () {
	                        var detailsObj = {},
	                            href = details;
	                        detailsObj._get = { href: href };
	                        detailsObj.get = function (params, returnFields) {
	                            return _this5._publicsMethods.get.apply(_this5, [params, returnFields, detailsObj]);
	                        };
	                        _this5[name] = detailsObj;
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
	                            var _href = reqMethodDetails;
	                            details['_' + reqMethod] = { href: _href };
	                            details[reqMethod] = function (params) {
	                                return _this5._publicsMethods[reqMethod].apply(_this5, [params, details]);
	                            };
	                        } else {
	                            //if the method is not req
	                            //throw an error
	                            return {
	                                v: {
	                                    v: {
	                                        success: false,
	                                        errorType: 'TypeError',
	                                        message: 'Expected an Object for method ' + reqMethod + ', instead found string "' + reqMethodDetails,
	                                        expectedType: 'Object',
	                                        gotType: 'String'
	                                    }
	                                }
	                            };
	                        }
	                    } else {
	                        //if its a normal object with at least a href property

	                        //save details to different location in object
	                        details['_' + reqMethod] = reqMethodDetails;

	                        //replace method in object with function to use the endpoint
	                        details[reqMethod] = function (params) {
	                            return _this5._publicsMethods[reqMethod].apply(_this5, [params, details]);
	                        };
	                    }
	                };

	                for (var reqMethod in details) {
	                    var _ret3 = _loop2(reqMethod);

	                    if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
	                }

	                _this5[name] = details;
	            };

	            //loop endpoints
	            for (var name in endpoints) {
	                var _ret = _loop(name);

	                switch (_ret) {
	                    case 'continue':
	                        continue;

	                    default:
	                        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	                }
	            }

	            return {
	                success: true
	            };
	        }
	    }, {
	        key: '_parseEndpointStr',
	        value: function _parseEndpointStr(endpoint, givenParams) {
	            var endpointParamNames = this._getUrlEndpointParamNames(endpoint),
	                requiredParamNames = endpointParamNames.required,
	                optionalParamNames = endpointParamNames.optional;

	            //check if all required params are provided
	            for (var i = 0, l = requiredParamNames.length; i < l; i++) {
	                var name = requiredParamNames[i];
	                if (typeof givenParams[name] === 'undefined') {
	                    //throw error
	                    return {
	                        success: false,
	                        errorType: 'Error',
	                        message: 'Param "' + name + '" is required for endpoint ' + endpoint
	                    };
	                }
	            }

	            //check if there aren't any params that are not needed
	            for (var _name in givenParams) {
	                if (requiredParamNames.indexOf(_name) === -1 && optionalParamNames.indexOf(_name) === -1) {
	                    //throw error
	                    return {
	                        success: false,
	                        errorType: 'Error',
	                        message: 'Param "' + _name + '" is not not found in the schema for endpoint ' + endpoint
	                    };
	                }
	            }

	            //parse endpoint URL
	            requiredParamNames.forEach(function (name) {
	                var val = givenParams[name];
	                endpoint = endpoint.replace(':' + name, val);
	            });

	            var queryData = {};
	            optionalParamNames.forEach(function (name) {
	                var val = givenParams[name],
	                    paramRegex = new RegExp('(\\?|\\&)' + name);

	                //add to data object, if there is a value for it
	                if (typeof val !== 'undefined') {
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
	    }, {
	        key: '_getUrlEndpointParamNames',
	        value: function _getUrlEndpointParamNames(endpoint, params) {
	            var cleanEndpoint = endpoint.replace(/http(s)?\:\/\//, ''),
	                matches = [],
	                requiredParamMatches = endpoint.match(/\:([^\/\:\?]+)/g) || [],
	                optionalParamMatches = endpoint.match(/(\?|\&)([^\&]+)/g) || [];

	            requiredParamMatches = requiredParamMatches.map(function (match) {
	                return match.replace(/\:/g, '');
	            });

	            optionalParamMatches = optionalParamMatches.map(function (match) {
	                return match.replace(/\&|\?/g, '');
	            });

	            return {
	                required: requiredParamMatches,
	                optional: optionalParamMatches
	            };
	        }
	    }]);

	    return Schematics;
	}();

	;

	exports.default = Schematics;

/***/ },
/* 2 */
/***/ function(module, exports) {

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

/***/ }
/******/ ]);
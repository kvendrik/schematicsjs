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

	var _ParamParser = __webpack_require__(3);

	var _ParamParser2 = _interopRequireDefault(_ParamParser);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Schematics = function () {
	    function Schematics(schemaUrlOrGetMethod, httpMethod) {
	        var _this2 = this;

	        _classCallCheck(this, Schematics);

	        if (typeof schemaUrlOrGetMethod !== 'string' && typeof schemaUrlOrGetMethod !== 'function' || typeof httpMethod !== 'function') {
	            this._throwError('Please provide both a schema url or get method and a http method');
	            return;
	        }

	        //init param parser
	        var paramParser = new _ParamParser2.default(),
	            self = this;

	        //use the user's http method for requests
	        this._http = httpMethod;

	        this._publicsMethods = {
	            get: function get(params, returnFields, _obj) {
	                var _this = this;

	                //get endpoint details
	                var details = _obj._get;

	                //get parsed endpoint url
	                var result = paramParser.parseEndpointStr(details.href, params);

	                if (!result || !result.success) {
	                    return new Promise(function (resolve, reject) {
	                        return _this._rejectPromise(reject, result);
	                    });
	                } else {
	                    //add returnFields if present
	                    //that way the server will know
	                    //what returnFields to return
	                    if (typeof returnFields !== 'undefined') {
	                        result.queryData['return_fields[]'] = returnFields;
	                    }

	                    return new Promise(function (resolve, reject) {
	                        self._http({
	                            url: result.endpointUrl,
	                            data: result.queryData
	                        }).then(function (body) {
	                            return _this._processGetRes(body, resolve, reject);
	                        }).catch(reject);
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

	        if (typeof schemaUrlOrGetMethod === 'function') {
	            //if schemaUrlOrGetMethod is a function
	            //use it to get the intial schema
	            return new Promise(function (resolve, reject) {
	                new Promise(function (resolve, reject) {
	                    schemaUrlOrGetMethod(resolve, reject, httpMethod);
	                }).then(function (body) {
	                    return _this2._processGetRes(body, resolve, reject);
	                }).catch(reject);
	            });
	        } else {
	            //request initial endpoint schema
	            //which should contain a valid schema
	            return new Promise(function (resolve, reject) {
	                _this2._http({
	                    url: schemaUrlOrGetMethod
	                }).then(function (body) {
	                    return _this2._processGetRes(body, resolve, reject);
	                }).catch(reject);
	            });
	        }
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
	        key: '_processGetRes',
	        value: function _processGetRes(body, resolve, reject) {
	            //check if there is a schema
	            if (body && typeof body['$schema'] !== 'undefined') {
	                //response contains a schema
	                var schema = body['$schema'],
	                    schemaValid = this._validateSchema(schema);

	                //check if schema is valid
	                if (!schemaValid) {
	                    this._rejectPromise(reject, schemaValid.error);
	                } else {
	                    //if schema is valid
	                    //get api object
	                    var apiObject = this._constructAPIObject(schema);
	                    if (!apiObject) {
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
	                        _this3._http({
	                            type: reqName,
	                            url: details.href,
	                            data: params
	                        }).then(resolve).catch(reject);
	                    }
	                });
	            });
	        }
	    }, {
	        key: '_validateSchema',
	        value: function _validateSchema(schema) {
	            var schemaType = typeof schema === 'undefined' ? 'undefined' : _typeof(schema);

	            if (schemaType !== 'object') {
	                //not a valid schema
	                return {
	                    success: false,
	                    error: {
	                        errorType: 'TypeError',
	                        message: 'Thats not a valid schema. Expected type object, got type ' + schemaType,
	                        expectedType: 'Object',
	                        gotType: schemaType
	                    }
	                };
	            } else {
	                return true;
	            }
	        }
	    }, {
	        key: '_constructAPIObject',
	        value: function _constructAPIObject(schema) {
	            var _this4 = this;

	            var apiObject = {
	                getSchema: function getSchema() {
	                    return schema;
	                }
	            };

	            //loop endpoints

	            var _loop = function _loop(name) {
	                var details = schema[name];

	                //if details is a string
	                //the method is GET and the string is the href
	                if (typeof details === 'string') {
	                    var _ret2 = function () {
	                        var detailsObj = {},
	                            href = details;
	                        detailsObj._get = { href: href };
	                        detailsObj.get = function (params, returnFields) {
	                            return _this4._publicsMethods.get.apply(_this4, [params, returnFields, detailsObj]);
	                        };
	                        apiObject[name] = detailsObj;
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
	                                return _this4._publicsMethods[reqMethod].apply(_this4, [params, details]);
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
	                            return _this4._publicsMethods[reqMethod].apply(_this4, [params, details]);
	                        };
	                    }
	                };

	                for (var reqMethod in details) {
	                    var _ret3 = _loop2(reqMethod);

	                    if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
	                }

	                apiObject[name] = details;
	            };

	            for (var name in schema) {
	                var _ret = _loop(name);

	                switch (_ret) {
	                    case 'continue':
	                        continue;

	                    default:
	                        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	                }
	            }

	            return apiObject;
	        }
	    }]);

	    return Schematics;
	}();

	;

	exports.default = Schematics;

/***/ },
/* 2 */
/***/ function(module, exports) {

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

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ParamParser = function () {
	    function ParamParser() {
	        _classCallCheck(this, ParamParser);
	    }

	    _createClass(ParamParser, [{
	        key: 'parseEndpointStr',
	        value: function parseEndpointStr(schemaEndpoint) {
	            var givenParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	            var paramNames = this._getUrlEndpointParamNames(schemaEndpoint),
	                paramsValid = this._validateParams(schemaEndpoint, givenParams, paramNames);

	            if (!paramsValid.success) {
	                //if not success
	                //return results directly
	                return paramsValid;
	            }

	            var _parseEndpointUrl2 = this._parseEndpointUrl(schemaEndpoint, givenParams, paramNames);

	            var endpointUrl = _parseEndpointUrl2.endpointUrl;
	            var queryData = _parseEndpointUrl2.queryData;


	            return {
	                success: true,
	                endpointUrl: endpointUrl,
	                queryData: queryData
	            };
	        }
	    }, {
	        key: '_parseEndpointUrl',
	        value: function _parseEndpointUrl(schemaEndpoint, givenParams, _ref) {
	            var url = _ref.url;
	            var query = _ref.query;

	            var endpoint = schemaEndpoint;

	            //replace all required params {param}
	            url.required.forEach(function (name) {
	                var val = givenParams[name];
	                endpoint = endpoint.replace('{' + name + '}', val);
	            });

	            //replace all optional params {/param}
	            url.optional.forEach(function (name) {
	                var val = givenParams[name];
	                if (typeof val !== 'undefined') {
	                    endpoint = endpoint.replace('{/' + name + '}', '/' + val);
	                } else {
	                    endpoint = endpoint.replace('{/' + name + '}', '');
	                }
	            });

	            //get all optional query properties
	            //and if defined add them to the queryData
	            //object
	            var queryData = {};
	            query.optional.forEach(function (name) {
	                var val = givenParams[name],
	                    paramRegex = new RegExp('\{?(\\?|\\,)' + name + '\}?');

	                //add to data object, if there is a value for it
	                if (typeof val !== 'undefined') {
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
	    }, {
	        key: '_validateParams',
	        value: function _validateParams(schemaEndpoint, givenParams, _ref2) {
	            var url = _ref2.url;
	            var query = _ref2.query;


	            //check if all required params are provided
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = url.required[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    name = _step.value;

	                    if (typeof givenParams[name] === 'undefined') {
	                        //throw error
	                        return {
	                            success: false,
	                            errorType: 'Error',
	                            message: 'Param "' + name + '" is required for endpoint ' + schemaEndpoint
	                        };
	                    }
	                }

	                //check if there aren't any params that are not needed
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            for (var _name in givenParams) {
	                if (url.required.indexOf(_name) === -1 && url.optional.indexOf(_name) === -1 && query.optional.indexOf(_name) === -1) {
	                    //throw error
	                    return {
	                        success: false,
	                        errorType: 'Error',
	                        message: 'Param "' + _name + '" is not not found in the schema for endpoint ' + schemaEndpoint
	                    };
	                }
	            }

	            return {
	                success: true
	            };
	        }
	    }, {
	        key: '_getUrlEndpointParamNames',
	        value: function _getUrlEndpointParamNames(endpoint) {
	            //get clean endpoint without protocol
	            var cleanEndpoint = endpoint.replace(/http(s)?\:\/\//, ''),
	                matches = [];

	            //match url and query params
	            var requiredUrlParamMatches = endpoint.match(/\/\{([^\/\:\?]+)\}/g) || [],
	                optionalUrlParamMatches = endpoint.match(/\{\/([^\{\}\?]+)\}/g) || [],
	                optionalQueryParamMatches = endpoint.match(/(\?|\,)([^\,\}]+)/g) || [];

	            var cleanUrlParam = function cleanUrlParam(str) {
	                //remove brackets and first slash in case
	                //its an optional url param
	                return str.replace(/\{|\}/g, '').replace('/', '');
	            };

	            //clean url params
	            requiredUrlParamMatches = requiredUrlParamMatches.map(cleanUrlParam);
	            optionalUrlParamMatches = optionalUrlParamMatches.map(cleanUrlParam);

	            //get query param names
	            optionalQueryParamMatches = optionalQueryParamMatches.map(function (match) {
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
	    }]);

	    return ParamParser;
	}();

	;

	exports.default = ParamParser;

/***/ }
/******/ ]);
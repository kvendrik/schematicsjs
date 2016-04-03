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
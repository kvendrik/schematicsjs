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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SchemaParser = require('./SchemaParser');

var _SchemaParser2 = _interopRequireDefault(_SchemaParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Schematics = function () {
  function Schematics(endpoints) {
    _classCallCheck(this, Schematics);

    this._storeEndpoints(endpoints);

    this._publicsMethods = {
      get: function get(params, callback, obj) {
        //get endpoint details
        var details = obj._get;

        //get parsed endpoint url
        var endpointUrl = details.templated ? this._parseEndpointStr(details._cleanHref, params) : details.href;

        console.log(endpointUrl);
      },

      post: function post(params, callback, obj) {
        //get endpoint details
        var details = obj._post;
        var schemaParser = new _SchemaParser2.default(details.params);

        schemaParser.checkParamsValid(params, function (result) {
          if (!result.valid) {
            throw new Error(result.message);
          }

          console.log('VALID');
        });
      }
    };
  }

  _createClass(Schematics, [{
    key: '_storeEndpoints',
    value: function _storeEndpoints(endpoints) {
      var _this = this;

      var _loop = function _loop(name) {
        var details = endpoints[name];

        //loop request methods

        var _loop2 = function _loop2(reqMethod) {
          var reqMethodDetails = details[reqMethod];

          reqMethodDetails._cleanHref = reqMethodDetails.href.replace(/http(s)?\:\/\//, '');

          //save details to different location in object
          details['_' + reqMethod] = reqMethodDetails;

          //replace method in object with function to use the endpoint
          details[reqMethod] = function (params, callback) {
            return _this._publicsMethods[reqMethod].apply(_this, [params, callback, details]);
          };
        };

        for (var reqMethod in details) {
          _loop2(reqMethod);
        }

        _this[name] = details;
      };

      //loop endpoints
      for (var name in endpoints) {
        _loop(name);
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
      var matches = endpoint.match(/\:([^\/\:]+)/g);
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

},{"./SchemaParser":1}],3:[function(require,module,exports){
'use strict';

var _Schematics = require('./Schematics');

var _Schematics2 = _interopRequireDefault(_Schematics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.Schematics = _Schematics2.default;

},{"./Schematics":2}]},{},[3]);

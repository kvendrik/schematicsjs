import SchemaParser from './SchemaParser'

class Schematics {

  constructor(endpoints){
    this._storeEndpoints(endpoints);

    this._publicsMethods = {
      get: function(params, callback, obj){
        //get endpoint details
        let details = obj._get;

        //get parsed endpoint url
        let endpointUrl = details.templated ? this._parseEndpointStr(details._cleanHref, params) : details.href;

        console.log(endpointUrl);
      },

      post: function(params, callback, obj){
        //get endpoint details
        let details = obj._post;
        let schemaParser = new SchemaParser(details.params);

        schemaParser.checkParamsValid(params, function(result){
          if(!result.valid){
            throw new Error(result.message);
          }

          console.log('VALID');
        });
      }
    }
  }

  _storeEndpoints(endpoints){
    //loop endpoints
    for(let name in endpoints){
      let details = endpoints[name];
      
      //loop request methods
      for(let reqMethod in details){
        let reqMethodDetails = details[reqMethod];
        
        reqMethodDetails._cleanHref = reqMethodDetails.href.replace(/http(s)?\:\/\//, '');
        
        //save details to different location in object
        details['_'+reqMethod] = reqMethodDetails;
        
        //replace method in object with function to use the endpoint
        details[reqMethod] = (params, callback) => this._publicsMethods[reqMethod].apply(this, [params, callback, details]);
      }
      
      this[name] = details;
    }
  }
  
  _parseEndpointStr(endpoint, givenParams){
    let endpointParamNames = this._getUrlEndpointParamNames(endpoint);
    
    //check if all required params are provided
    endpointParamNames.forEach(function(name){
      if(typeof givenParams[name] === 'undefined'){
        //throw error
        throw new Error('Param "'+name+'" is required for endpoint '+endpoint);
      }
    });
    
    //parse endpoint URL
    for(let name in givenParams){
      let val = givenParams[name];
      endpoint = endpoint.replace(':'+name, val);
    }
    
    return endpoint;
  }
  
  _getUrlEndpointParamNames(endpoint, params){
    let matches = endpoint.match(/\:([^\/\:]+)/g);
    matches = matches.map(function(match){
      return match.replace(/\:/g, '');
    });
    return matches
  }
  
};

export default Schematics
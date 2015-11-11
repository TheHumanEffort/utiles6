/*
 * UtilES6 - a collection of ES6 modules offer some handy patterns
 * that I have found useful.
 * 
 * options.js - is a collection of tools for managing options hashes
 */

module.exports = {
  check : function(hash,options) {
    var ret = {};
    
    if(options.required) {
      for(var requiredKey in options.required) {
        if(!(requiredKey in hash)) {
          throw new Error("InvalidArgumentException",`${ requiredKey } required, ${ options.required[requiredKey].description }`);
        } else {
          ret[requiredKey] = hash[requiredKey];
        }
      }
    }
    
    if(options.optional) {
      for(var optionalKey in options.optional) {
        if(optionalKey in hash) {
          ret[optionalKey] = hash[optionalKey]
        } else {
          ret[optionalKey] = options.optional[optionalKey]['default'];
        }
      }
    }
    
    return ret;
  }
}

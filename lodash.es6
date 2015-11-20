(function() {
    if(typeof window != 'undefined')
    {
      _ = window._;
    }
    else
    {
      _ = require('lodash-es');
    }
})();

module.exports = _;

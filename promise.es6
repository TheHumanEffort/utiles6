var Promise;

(function check() {
    if(typeof window != 'undefined')
    {
      Promise = window.Promise;
    }
    else
    {
      Promise = require('bluebird');

      Promise.config({
        warnings: true,
        longStackTraces: true,
        cancellation: true
      });
    }
})();


module.exports = Promise;

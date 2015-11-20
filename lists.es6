/*
 * UtilES6 - a collection of ES6 modules offer some handy patterns
 * that I have found useful.
 *
 * lists.es6 - this is a collection of underscore-inspired commands
 * for list management that do not block, and return a promise with
 * the results.
 *
 */

import Runtime from './runtime.es6';
import Promise from './promise.es6';

module.exports = {
  filter: function(list,callback,context) {
    return new Promise((resolve,reject,onCancel) => {
      var ctx = {
        list: list,
        res: [],
        index: 0,
        cancelled: false
      };

      if(onCancel) {
        onCancel(function() {
          ctx.cancelled = true;
        });
      }

      function worker() {
        if(this.cancelled) return false;

        if(this.index >= this.list.length) {
          // done!
          resolve(this.res);
          return false;
        }

        var r = false;
        var v = this.list[this.index++];

        try {
          r = callback(v);
        } catch(x) {
          reject(x);
        }

        if(r) this.res.push(v);

        return true;
      }

      Runtime.process(worker,ctx);
    });
  }
};

import Runtime from './runtime.es6';
import Promise from './promise.es6';
import { debug , error, warning } from './log.es6';

let _ = require('./lodash.es6');

module.exports = {
  deepMap: function(object,callback,context) {
    return new Promise((resolve,reject,onCancel) => {
      var ctx = {
        object: object,
        res: [],
        toDo: [],  // each toDo item will be a hash with a 'value' and a 'path'
        toDoIndex: 0,
        cancelled: false
      };

      if(onCancel) {
        onCancel(() => { ctx.cancelled = true; });
      } else {
        warning("Cancellation spec not supported by Promise - consider using Bluebird.");
      }

      function worker() {
        if(this.cancelled) return false;
        if(this.toDo.length <= this.toDoIndex) {
          resolve(this.res);
          return false;
        }

        var r = undefined;
        var toDo = this.toDo[this.toDoIndex++];
        var value = toDo.value;
        var path = toDo.path;

        if(_.isObject(value) || _.isArray(value))
        {
          for(var k in value) {
            this.toDo.push({ value: value[k] , path: path+'.'+k });
          }
        }
        else {
          this.res.push(callback.call(context,value,path));
        }
      }

      toDo.push({ 'value': object , 'path': '' });

      Runtime.process(worker,ctx);
    });

  }

};

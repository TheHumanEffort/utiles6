/*
 * UtilES6 - a collection of ES6 modules offer some handy patterns
 * that I have found useful.
 *
 * diff.js - is a collection of difference-management code
 */

var _ = require('./lodash.es6');

var Options = require('./options.es6');
var Runtime;

function run(fn,context,options) {
  if(options.sync == false) {
    Runtime = Runtime || require('./runtime.es6');
    return Runtime.process(fn,context,options);
  } else {
    while(fn.call(context) !== false);
    return function() {};
  }
};

// diff.set(options), call back to add/remove items from options.start
// so that it becomes options.target.

var Constants = {
  ADD: 'add',
  REMOVE: 'remove'
};

function additions(options) {
  var objects = _.difference(options.target,options.start);
  return _.map(objects,(object) => {
    return { type: Constants.ADD, object: object }
  });
}

function removals(options) {
  var objects = _.difference(options.start,options.target);
  return _.map(objects,(object) => { return { type: Constants.REMOVE, object: object } });
}

exports._perform = function(operation,options) {
  function p(fn,a1) {
    if(fn)
      return fn.call(options.context,a1);
    else
      throw new Error("Could not find callback for "+operation.type);
  };

  switch(operation.type) {
  case Constants.ADD:
    return p(options.add,operation.object);
  case Constants.REMOVE:
    return p(options.remove,operation.object);
  }
};

const SetOptions = {
  required: {
    start: { type: 'set', description: 'array containing the initial state of the set' },
    target: { type: 'set', description: 'array containing the target state of the set' },
    remove: { type: 'function', description: 'callback which takes one argument, the item to remove.' },
    add: { type: 'function', description: 'callback which takes one argument, the item to add to the system'},
  },
  optional: {
    sync: { type: 'boolean', description: 'should the operation return immediately, or once the whole operation has completed', 'default': true },
    context: { type: 'object', description: 'the context for callbacks', 'default': undefined },
    removeFirst: { type: 'boolean', description: 'if true, remove items first, then add.', 'default': false }
  }
}

exports.set = function(options) {
  return new Promise((resolve,reject,onCancel) => {
    options = Options.check(options,SetOptions);

    var toAdd = additions(options);
    var toRemove = removals(options);
    var operations;

    if(options.removeFirst)
      operations = toRemove.concat(toAdd);
    else
      operations = toAdd.concat(toRemove);

    var context = {
      operations: additions(options).concat(removals(options)),
      operationIndex: 0,
      cancelled: false,
      paused: false
    };

    if(onCancel) {
      onCancel(() => { context.cancelled = true; })
    }

    var module = this;

    function worker() {
      if(this.paused) return Runtime.WAIT;
      if(this.cancelled) return false;

      if(options.progress) options.progress.call(options.context,this.operationIndex,this.operations.length);
      
      if(this.operationIndex >= this.operations.length) {
        return false;
      }

      var res = module._perform(this.operations[this.operationIndex++],options);

      if(res && res.then) {
        context.paused = true;
        res.finally(function() {
          context.paused = false;
        });
      }

      return true;
    }

    run(worker,context,options);
  });
}

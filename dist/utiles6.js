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

	var diff = __webpack_require__(1);
	var runtime = __webpack_require__(4);
	var log = __webpack_require__(5);
	var lists = __webpack_require__(6);

	module.exports = {
	  diff: diff,
	  runtime: runtime,
	  log: log,
	  lists: lists
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*
	 * UtilES6 - a collection of ES6 modules offer some handy patterns
	 * that I have found useful.
	 * 
	 * diff.js - is a collection of difference-management code
	 */

	var _ = window._;
	if (typeof window._ == 'undefined') {
	  _ = __webpack_require__(2);
	}

	var Options = __webpack_require__(3);
	var Runtime;

	function run(fn, context, options) {
	  if (options.sync == false) {
	    Runtime = Runtime || __webpack_require__(4);
	    Runtime.run(fn, context, options);
	  } else {
	    while (fn.call(context) !== false);
	  }
	};

	// diff.set(options), call back to add/remove items from options.start
	// so that it becomes options.target. 

	var Constants = {
	  ADD: 'add',
	  REMOVE: 'remove'
	};

	function additions(options) {
	  var objects = _.difference(options.target, options.start);
	  return _.map(objects, function (object) {
	    return { type: Constants.ADD, object: object };
	  });
	}

	function removals(options) {
	  var objects = _.difference(options.start, options.target);
	  return _.map(objects, function (object) {
	    return { type: Constants.REMOVE, object: object };
	  });
	}

	exports._perform = function (operation, options) {
	  function p(fn, a1) {
	    if (fn) return fn.call(options.context, a1);else throw new Error("Could not find callback for " + operation.type);
	  };

	  switch (operation.type) {
	    case Constants.ADD:
	      return p(options.add, operation.object);
	    case Constants.REMOVE:
	      return p(options.remove, operation.object);
	  }
	};

	var SetOptions = {
	  required: {
	    start: { type: 'set', description: 'array containing the initial state of the set' },
	    target: { type: 'set', description: 'array containing the target state of the set' },
	    remove: { type: 'function', description: 'callback which takes one argument, the item to remove.' },
	    add: { type: 'function', description: 'callback which takes one argument, the item to add to the system' }
	  },
	  optional: {
	    sync: { type: 'boolean', description: 'should the operation return immediately, or once the whole operation has completed', 'default': true },
	    context: { type: 'object', description: 'the context for callbacks', 'default': undefined }
	  }
	};

	exports.set = function (options) {
	  options = Options.check(options, SetOptions);

	  var context = {
	    operations: additions(options).concat(removals(options)),
	    operationIndex: 0
	  };

	  var module = this;

	  function worker() {
	    if (this.operationIndex >= this.operations.length) {
	      return false;
	    }

	    module._perform(this.operations[this.operationIndex++], options);

	    return true;
	  }

	  return run(worker, context, options);
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = lodash-es;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	/*
	 * UtilES6 - a collection of ES6 modules offer some handy patterns
	 * that I have found useful.
	 * 
	 * options.js - is a collection of tools for managing options hashes
	 */

	module.exports = {
	  check: function check(hash, options) {
	    var ret = {};

	    if (options.required) {
	      for (var requiredKey in options.required) {
	        if (!(requiredKey in hash)) {
	          throw new Error("InvalidArgumentException", requiredKey + " required, " + options.required[requiredKey].description);
	        } else {
	          ret[requiredKey] = hash[requiredKey];
	        }
	      }
	    }

	    if (options.optional) {
	      for (var optionalKey in options.optional) {
	        if (optionalKey in hash) {
	          ret[optionalKey] = hash[optionalKey];
	        } else {
	          ret[optionalKey] = options.optional[optionalKey]['default'];
	        }
	      }
	    }

	    return ret;
	  }
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	 * UtilES6 - a collection of ES6 modules offer some handy patterns
	 * that I have found useful.
	 * 
	 * runtime.js - is a mechanism for organizing code so that it behaves
	 * better in a runtime-critical way.  The idea is that nothing should 
	 * run for longer than a very small number of ms.  Runtime will warn 
	 * you when that happens, and give you tools for preventing it.
	 *
	 */

	var globalOptions = {
	  // warnLatency - print a warning if a callback executes in excess of
	  // warnLatency number of milliseconds.
	  warnLatency: 4,

	  // targetLatency - execute callbacks continuously until they exceed
	  // the execution time here:
	  targetLatency: 1,

	  // interval - the interval that is used for processing - this is set
	  // to give plenty of time in between to get non-background work done,
	  // and at the same high enough to let background jobs get some real
	  // work done.
	  interval: 50
	};

	var operations = [];

	var interval = null;
	var intervalPeriod = null;

	var Runtime = {
	  // Runtime.run runs a callback immediately, checking it to ensure
	  // it does not exceed a run time of warnLatency.
	  run: function run(callback, context, options) {
	    var startDate = new Date();

	    var res;
	    try {
	      res = callback.call(context);
	    } catch (x) {
	      this._reportException(x);
	    }

	    var endDate = new Date();

	    this._intervalFinished(endDate - startDate);

	    return res;
	  },

	  // Runtime.process adds a callback to the processing queue, which
	  // will repeatedly call the callback until it returns false.  Every
	  // call is checked for run-time integrity.
	  process: function process(callback, context, options) {
	    operations.push({ callback: callback,
	      context: context,
	      options: options });

	    this._updateInterval();
	  },

	  // Runtime.config allows you to change the default configuration of
	  // the runtime system -
	  // { maximum
	  config: function config(options) {},

	  // internal functions:

	  // _intervalCallback - this is the function that is called that begins
	  // each work cycle.
	  _intervalCallback: function _intervalCallback() {
	    var intervalStart = new Date();

	    while (new Date() - intervalStart < globalOptions.targetLatency) {
	      this._runOne();
	    }

	    var intervalEnd = new Date();
	    this._intervalFinished(intervalEnd - intervalStart);
	  },

	  // run a single item from the operations queue:
	  _runOne: function _runOne() {
	    var operation = operations.shift();

	    if (!operation) {
	      this._updateInterval();
	      return;
	    }

	    var res = true;

	    res = this.run(operation.callback, operation.context, operation.options);

	    if (res !== false) {
	      operations.push(operation);
	    }
	  },

	  // an exception occurred during running,
	  _reportException: function _reportException(exception) {
	    console.error("Exception during runtime callback");
	    console.error(exception);
	  },

	  // _intervalFinished -
	  _intervalFinished: function _intervalFinished(intervalDuration) {
	    if (intervalDuration > globalOptions.warnLatency) {
	      console.warn("Interval exceeded warning threshold - at " + intervalDuration + "ms (> " + globalOptions.warnLatency + ")");
	    }
	  },

	  // _updateInterval: makes sure that the interval is firing if it
	  // should be, or off if it should be (and making sure that it is
	  // firing at the rate that is currently configured).

	  _updateInterval: function _updateInterval() {
	    if (operations.length) {
	      if (intervalPeriod != globalOptions.interval) this._stopInterval();

	      this._startInterval();
	    } else {
	      this._stopInterval();
	    }
	  },

	  _stopInterval: function _stopInterval() {
	    if (interval) {
	      clearInterval(interval);
	      interval = null;
	    }
	    intervalPeriod = null;
	  },
	  _startInterval: function _startInterval() {
	    var _this = this;

	    if (!interval) {
	      interval = setInterval(function () {
	        _this._intervalCallback();
	      }, globalOptions.interval);
	      intervalPeriod = globalOptions.interval;
	    }
	  }
	};

	exports.default = Runtime;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.config = config;
	exports.log = log;
	var FATAL = exports.FATAL = 5;
	var ERROR = exports.ERROR = 4;
	var WARN = exports.WARN = 3;
	var INFO = exports.INFO = 2;
	var DEBUG = exports.DEBUG = 1;

	var options = {
	  level: DEBUG
	};

	function config(opts) {
	  for (var k in opts) options[k] = opts[k];
	}

	function out(level) {
	  var _console, _console2, _console3;

	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  // could get clever-er here:
	  if (level >= ERROR) (_console = console).error.apply(_console, args);else if (level == WARN) (_console2 = console).warn.apply(_console2, args);else (_console3 = console).log.apply(_console3, args);
	}

	function log(level /* , arguments... */) {
	  if (level >= options.level) {
	    out.apply(this, arguments);
	  }
	}

	function logger(level) {
	  return function () {
	    log.apply(undefined, [level].concat(Array.prototype.slice.call(arguments)));
	  };
	}

	var info = exports.info = logger(INFO);
	var debug = exports.debug = logger(DEBUG);
	var warn = exports.warn = logger(WARN);
	var error = exports.error = logger(ERROR);
	var fatal = exports.fatal = logger(FATAL);

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _runtime = __webpack_require__(4);

	var _runtime2 = _interopRequireDefault(_runtime);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	  filter: function filter(list, callback, context) {
	    return new Promise(function (resolve, reject) {
	      var ctx = {
	        list: list,
	        res: [],
	        index: 0
	      };

	      function worker() {
	        if (this.index >= this.list.length) {
	          // done!
	          resolve(this.res);
	          return false;
	        }

	        var r = false;
	        var v = this.list[this.index++];

	        try {
	          r = callback(v);
	        } catch (x) {
	          reject(x);
	        }

	        if (r) this.res.push(v);

	        return true;
	      }

	      _runtime2.default.process(worker, ctx);
	    });
	  }
	}; /*
	    * UtilES6 - a collection of ES6 modules offer some handy patterns
	    * that I have found useful.
	    * 
	    * lists.es6 - this is a collection of underscore-inspired commands
	    * for list management that do not block, and return a promise with
	    * the results.
	    *
	    */

/***/ }
/******/ ]);
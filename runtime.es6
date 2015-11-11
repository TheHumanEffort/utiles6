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
}

var operations = [];

var interval = null;
var intervalPeriod = null;

var Runtime = {
  // Runtime.run runs a callback immediately, checking it to ensure
  // it does not exceed a run time of warnLatency.
  run: function(callback,context,options) {
    var startDate = new Date();

    var res;
    try {
      res = callback.call(context);
    } catch(x) {
      this._reportException(x);
    }

    var endDate = new Date();

    this._intervalFinished(endDate-startDate);

    return res;
  },

  // Runtime.process adds a callback to the processing queue, which
  // will repeatedly call the callback until it returns false.  Every
  // call is checked for run-time integrity.
  process: function(callback,context,options) {
    operations.push({ callback: callback,
                      context: context,
                      options: options });

    this._updateInterval();
  },

  // Runtime.config allows you to change the default configuration of
  // the runtime system -
  // { maximum
  config: function(options) {
    
  },

  // internal functions:

  // _intervalCallback - this is the function that is called that begins
  // each work cycle.
  _intervalCallback: function() {
    var intervalStart = new Date();

    while((new Date() - intervalStart) < globalOptions.targetLatency) {
      this._runOne();
    }
    
    var intervalEnd = new Date();
    this._intervalFinished(intervalEnd - intervalStart);
  },

  // run a single item from the operations queue:
  _runOne: function() {
    var operation = operations.shift();
    
    if(!operation) {
      this._updateInterval();
      return;
    }
    
    var res = true;
    
    res = this.run(operation.callback,operation.context,operation.options);
    
    if(res !== false) {
      operations.push(operation);
    }
  },

  // an exception occurred during running, 
  _reportException: function(exception) {
    console.error("Exception during runtime callback");
    console.error(exception);
  },
  
  // _intervalFinished - 
  _intervalFinished: function(intervalDuration) {
    if(intervalDuration > globalOptions.warnLatency) {
      console.warn(`Interval exceeded warning threshold - at ${ intervalDuration }ms (> ${ globalOptions.warnLatency })`);
    }
  },

  // _updateInterval: makes sure that the interval is firing if it
  // should be, or off if it should be (and making sure that it is
  // firing at the rate that is currently configured).

  _updateInterval: function() {
    if(operations.length) {
      if(intervalPeriod != globalOptions.interval)
        this._stopInterval();

      this._startInterval();
    } else {
      this._stopInterval();
    }
  },

  _stopInterval: function() {
    if(interval) {
      clearInterval(interval);
      interval = null;
    }
    intervalPeriod = null;
  },
  _startInterval: function() {
    if(!interval) {
      interval = setInterval(() => { this._intervalCallback() },globalOptions.interval);
      intervalPeriod = globalOptions.interval;
    }
  }
};

export default Runtime;

let diff = require('./diff.es6');
let runtime = require('./runtime.es6');
let log = require('./log.es6');
let lists = require('./lists.es6');

var UtilES6 = {
  diff: diff,
  runtime: runtime,
  log: log,
  lists: lists
};

module.exports = UtilES6;
window.utiles6 = UtilES6;

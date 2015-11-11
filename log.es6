export const FATAL=5
export const ERROR=4
export const WARN=3
export const INFO=2
export const DEBUG=1

let options = {
  level: DEBUG
}

export function config(opts) {
  for(var k in opts)
    options[k] = opts[k];
}

function out(level,...args) {
  // could get clever-er here:
  if(level >= ERROR)
    console.error(...args);
  else if(level == WARN)
    console.warn(...args);
  else
    console.log(...args);
}

export function log(level/* , arguments... */) {
  if(level >= options.level) {
    out.apply(this,arguments);
  }
}

function logger(level) {
  return function() {
    log(level,...arguments)
  }
}

export let info = logger(INFO);
export let debug = logger(DEBUG);
export let warn = logger(WARN);
export let error = logger(ERROR);
export let fatal = logger(FATAL);

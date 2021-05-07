/* eslint-disable */

/*
  console.json(json): Stringify JSON with colors.
  console.start(id): Save current date that will be used by console.end(id).
  console.end(id): Display `${id}: <elapsed_time_since_console_start>s`.
*/

'use strict';

require('colors');
const moment = require('moment');
const _ = require('lodash');

const loggers = {
  info: console.info,
  log: console.log,
  error: console.error,
  warn: console.warn,
};
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m',
};

const begins = {};

const timestamp = () => process.env.DISABLE_TIMESTAMPS ? undefined : `[${moment().format('HHmmssSSS')}]`

console.log = (...params) => loggers.log(...[...[COLORS.RESET, timestamp()].filter(Boolean), ...Array.prototype.slice.call(params)]);
console.llog = (...params) => loggers.log(...[...[COLORS.RESET, timestamp()].filter(Boolean), ...Array.prototype.slice.call(params)]);
console.info = (...params) => loggers.info(...[...[COLORS.GREEN, timestamp()].filter(Boolean), ...Array.prototype.slice.call(params), COLORS.RESET]);
console.warn = (...params) => loggers.warn(...[...[COLORS.YELLOW, timestamp()].filter(Boolean), ...Array.prototype.slice.call(params), COLORS.RESET]);
console.error = (...params) => loggers.error(...[...[COLORS.RED, timestamp()].filter(Boolean), ...Array.prototype.slice.call(params), COLORS.RESET]);
console.json = (...args) => {
  args.forEach(arg => {
    const initialArg = arg
    try {
      if (typeof arg !== 'string') {
        try {
          arg = JSON.stringify(arg, undefined, 2) || arg;
        } catch (error) { }
      }

      arg = arg && arg.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            return match.white.dim.italic.replace(/"/g, '');
          }
          return match.replace(/^"(.*)"/g, `${'"'.black.dim}${'$1'.red.bold}${'"'.black.dim}`);
        } if (/true|false/.test(match)) {
          return match.blue.underline.bold;
        } if (/null/.test(match)) {
          return match.gray;
        } if (/[0-9]+/.test(match)) {
          return match.green.bold;
        }
        return match;
      });

      console.llog(arg);
    } catch(error) {
      console.llog(initialArg)
    }
  })
};
console.log = console.json
console.info = console.json
console.start = (id = 'Duration') => {
  begins[id] = Date.now();
};
console.end = (id = 'Duration') => {
  console.log(`${id}: ${(Date.now() - begins[id]) / 1000}s.`);
};

global.wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
global.moment = moment
global.lo = _

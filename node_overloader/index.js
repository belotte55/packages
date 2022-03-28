/* eslint-disable */

/*
  console.json(json): Stringify JSON with colors.
  console.start(id): Save current date that will be used by console.end(id).
  console.end(id): Display `${id}: <elapsed_time_since_console_start>s`.
*/

'use strict';

require('colors');
const moment = require('moment');
const dayjs = require('dayjs');
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

const timestamp = () => process.env.DISABLE_TIMESTAMPS ? undefined : ` ${moment().format('HHmmssSSS')} `

const logger = (timestampColor) => {
  const loggerToUse = (...params) => loggers.log(...[timestamp().inverse.bold[timestampColor], ...Array.prototype.slice.call(params), COLORS.RESET])
  return (...args) => {
    args.forEach(arg => {
      const initialArg = arg
      try {
        if (arg instanceof Promise) {
          loggerToUse(`${'<'.red}${'Promise'.bold.gray}${'>'.red}`)
          return
        }
        if (typeof arg !== 'string') {
          try {
            arg = JSON.stringify(arg, undefined, 2) || arg;
          } catch (error) { }
        }

        arg = arg && arg.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|(^\[)-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|({|})|(\[((^[0-9]+m)|$)|])/g, (match) => {
          if (/\[[0-9]+m/.test(match)) {
            return match
          }
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              return match.replace(/^"(.*)"/g, `${'"'.black.dim}${'$1'.gray}${'"'.black.dim}`)
            }
            return match.replace(/^"(.*)"/g, `${'"'.black.dim}${'$1'.red.bold}${'"'.black.dim}`);
          } if (/true|false/.test(match)) {
            return match.blue.underline.bold;
          } if (/null/.test(match)) {
            return match.gray;
          } if (/(^\^\[\[)?[0-9]+/.test(match)) {
            return match.green.bold;
          } if (/{|}/.test(match)) {
            return match.cyan.bold;
          } if (/\[|]/.test(match)) {
          }
          return match;
        })

        loggerToUse(arg);
      } catch(error) {
        loggerToUse(initialArg)
      }
    })
  }
}

console.llog = (...params) => loggers.log(...[timestamp(), ...Array.prototype.slice.call(params), COLORS.RESET]);
console.json = logger('cyan');
console.log = logger('blue')
console.info = logger('green')
console.warn = logger('yellow')
console.error = logger('red')
console.start = (id = 'Duration') => {
  begins[id] = Date.now();
};
console.end = (id = 'Duration') => {
  console.log(`${id}: ${(Date.now() - begins[id]) / 1000}s.`);
};

global.wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
global.moment = moment
global.dayjs = dayjs
global.lo = _


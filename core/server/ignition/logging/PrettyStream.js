'use strict';
const moment = require('moment');
const {Transform} = require('stream');
const {format} = require('util');
const prettyJson = require('prettyjson');
const each = require('lodash/each');
const omit = require('lodash/omit');
const isArray = require('lodash/isArray');
const isEmpty = require('lodash/isEmpty');
const isObject = require('lodash/isObject');
const isString = require('lodash/isString');

const _private = {
  levelFromName: {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  },
  colorForLevel: {
    10: 'grey',
    20: 'grey',
    30: 'cyan',
    40: 'magenta',
    50: 'red',
    60: 'inverse',
  },
  colors: {
    bold: [1, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    white: [37, 39],
    grey: [90, 39],
    black: [30, 39],
    blue: [34, 39],
    cyan: [36, 39],
    green: [32, 39],
    magenta: [35, 39],
    red: [31, 39],
    yellow: [33, 39]
  }
};

function colorize(color, value) {
  return [
    '\x1B[',
    _private.colors[color][0],
    'm',
    value,
    '\x1B[',
    _private.colors[color][1],
    'm'
  ].join('');
}

function statusCode(status) {
  const color = status >= 500 ? 'red'
    : status >= 400 ? 'yellow'
      : status >= 300 ? 'cyan'
        : status >= 200 ? 'green'
          : 0; // No color
  
  return colorize(color, status);
}

class PrettyStream extends Transform {
  constructor(options = {}) {
    super(options);
    
    this.mode = options.mode || 'short';
  }
  
  write(data, enc, cb) {
    // Bunyan sometimes passes things as objects. Because of this, we need to make sure the data is
    // converted to JSON
    if (isObject(data) && !(data instanceof Buffer)) {
      data = JSON.stringify(data);
    }
    
    super.write(data, enc, cb);
  }
  
  _transform(data, enc, cb) {
    if (!isString(data)) { data = data.toString(); }
    
    // Remove trailing newline if any
    data = data.replace(/\\n$/, '');
    
    try {
      data = JSON.parse(data);
    } catch (err) {
      cb(err);
      // If data is not JSON we don't want to continue processing as if it is
      return;
    }
    
    let output = '';
    let bodyPretty = '';
    let logLevel = _private.levelFromName[data.level].toUpperCase();
    const time = moment(data.time).format('YYYY-MM-DD HH:mm:ss');
    const codes = _private.colors[_private.colorForLevel[data.level]];
    
    logLevel = ['\x1B[', codes[0], 'm', logLevel, '\x1B[', codes[1], 'm'].join('');
    
    // CASE: Bunyan passes each plain string/integer as `msg` attribute (logging.info('HEY!'))
    // CASE: Bunyan extended this by figuring out a message in an error object (new Error('message'))
    if (data.msg && !data.err) {
      bodyPretty += data.msg;
      output += format('[%s] %s %s\n', time, logLevel, bodyPretty);
    }
    
    // CASE: log objects in pretty json format
    else {
      // common log format:
      //   127.0.0.1 user identifier user-id [10/oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
      
      // If all values are available we log in common format
      // can be extended to define from outside, but not important
      try {
        output += format('%s [%s] "%s %s" %s %s\n',
          logLevel,
          time,
          data.req.method.toUpperCase(),
          data.req.originalUrl,
          statusCode(data.res.statusCode),
          data.res.responseTime
        );
      } catch (err) {
        output += format('[%s] %s\n', time, logLevel);
      }
      
      each(omit(data, ['time', 'level', 'name', 'hostname', 'pid', 'v', 'msg']), function(value, key) {
        // We always output errors for now
        if (isObject(value) && value.message && value.stack) {
          let error = '\n';
          if (value.name) {
            error += colorize(_private.colorForLevel[data.level], `NAME:${value.name}`) + '\n';
          }
          if (value.code) {
            error += colorize(_private.colorForLevel[data.level], `CODE:${value.code}`) + '\n';
          }
          error += colorize(_private.colorForLevel[data.level], `MESSAGE:${value.message}`) + '\n\n';
          if (value.level) {
            error += colorize('white', 'level:') + colorize('white', value.level) + '\n\n';
          }
          if (value.context) {
            error += colorize('white', value.context) + '\n';
          }
          if (value.help) {
            error += colorize('yellow', value.help) + '\n';
          }
          if (value.errorDetails) {
            error += colorize(
              _private.colorForLevel[data.level],
              `ERROR DETAILS:\n${prettyJson.render(
                (isArray(value.errorDetails) ? value.errorDetails[0] : value.errorDetails),
                {noColor: true},
                4
              )}`
            ) + '\n\n';
          }
          if(value.stack && !value.hideStack) {
            error += colorize('white', value.stack) + '\n';
          }
          
          output += format('%s\n', colorize(_private.colorForLevel[data.level], error));
        }
        else if (isObject(value)) {
          bodyPretty += `\n${colorize('yellow, key.toUpperCase()')}\n`;
          let sanitized = {};
          each(value, function(innerValue, innerKey) {
            if (!isEmpty(innerValue)) {
              sanitized[innerKey] = innerValue;
            }
          });
          
          bodyPretty += `${prettyJson.render(sanitized, {})}\n`;
        }
        else {
          bodyPretty += `${prettyJson.render(value, {})}\n`
        }
      });
      
      if (this.mode !== 'short') {
        output += format('%s\n', colorize('grey', bodyPretty));
      }
    }
    
    return cb(null, output);
  }
}

module.exports = PrettyStream;

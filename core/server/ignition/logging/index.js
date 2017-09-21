'use strict';
const NahangLogger = require('./NahangLogger');

module.exports = function createNewInstance({domain, env, mode, level, transports, rotation, path, loggly}) {
  return new NahangLogger({
    domain,
    env,
    mode,
    level,
    transports,
    rotation,
    path,
    loggly,
  });
};

module.exports.NahangLogger = NahangLogger;

'use strict';

const Base = require('./base');

// Enable event listeners
require('./base/listeners');

const capitalize = str => `${str.substr(0, 1).toUpperCase()}${str.substr(1)}`;

const models = [
  'accessToken',
  'brute',
  'client',
  'permission',
  'refreshToken',
  'settings',
  'user',
];

const init = function init() {
  exports.Base = Base;
  models.forEach(name => Object.assign(exports, {
    [capitalize(name)]: require(`./${name}`),
  }));
};

exports.init = init;

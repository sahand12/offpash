'use strict';

const Base = require('./base');

// Enable event listeners
require('./base/listeners');

const models = [
  'AccessToken',
  'Brute',
  'Client',
  'Permission',
  'RefreshToken',
  'Settings',
  'User',
];

const init = function init() {
  exports.Base = Base;
  models.forEach(name => Object.assign(exports, {name: require('./${name}')}));
};

exports.init = init;

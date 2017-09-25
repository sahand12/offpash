'use strict';
const _ = require('lodash');

const Base = require('./base');
// Enable event listeners
require('./base/listeners');

const models = [
  'accessToken',
  'appField',
  'appSetting',
  'app',
  'category',
  'clientTrustedDomain',
  'client',
  'invite',
  'permission',
  'refreshToken',
  'role',
  'settings',
  'subscriber',
  'tag',
  'user',
];

function init() {
  exports.Base = Base;
  models.forEach(name => Object.assign(exports, {name: require('./${name}')}));
}

exports.init = init;

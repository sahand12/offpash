'use strict';
const Nconf = require('nconf');
const path = require('path');
const debug = require('debug')('nahang:config');

const utils = require('./utils');
const env = process.env.NODE_ENV || 'development';
let _private = {};

_private.loadNconf = function loadNconf({
  baseConfigPath = __dirname,
  customConfigPath = process.cwd()
} = {}) {
  debug('config start');
  const nconf = new Nconf.Provider();
  
  /**
   * No channel can override the overrides
   */
  nconf.file('overrides', path.join(baseConfigPath, 'overrides.json'));
  
  /**
   * Command line arguments
   */
  nconf.argv();
  
  /**
   * env arguments
   */
  nconf.env({
    separator: '__'
  });
  
  nconf.file('custom-env', path.join(customConfigPath, `config.${env}.json`));
  nconf.file('default-env', path.join(baseConfigPath, 'env', `config.${env}.json`));
  nconf.file('defaults', path.join(baseConfigPath, 'defaults.json'));
  
  nconf.getContentPath = utils.getContentPath.bind(nconf);
  nconf.doesContentPathExist = utils.doesContentPathExist.bind(nconf);
  
  /**
   * Check if the URL in config has a protocol
   */
  nconf.checkUrlProtocol = utils.checkUrlProtocol.bind(nconf);
  nconf.checkUrlProtocol();
  
  /**
   * Ensure that the content path exists
   */
  nconf.doesContentPathExist();
  
  /**
   * Values we have to set manually
   */
  nconf.set('env', env);
  
  // Wrap this in a check, otherwise nconf.get() is executed unnecessarily
  // To output this, use DEBUG=nahang:*,nahang-config
  if (debug.enabled('nahang-config')) {
    debug(nconf.get());
  }
  
  debug('config end');
  return nconf;
};

module.exports = _private.loadNconf();
module.exports.loadNconf = _private.loadNconf;

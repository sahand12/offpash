'use strict';

// # Bootup
/**
 * make sure overrides gets called first!
 * - Keeping the overrides require here works for installing Nahang as npm!
 *
 * The call order is the following
 * - root index requires core module
 * - core index requires server module
 * - overrides is the first package to load
 */
require('./overrides');

// Module Dependencies
const debug = require('debug')('boot:init');

// Config should be first require, as it triggers the initial load of the config files
const config = require('./config');
const i18n = require('./i18n');
const models = require('./models');
const auth = require('./auth');
const dbHealth = require('./data/db/health');
const NahangServer = require('./nahang-server');
const settings = require('./settings');
const utils = require('./utils');

// ## Initialize Nahang
function init(options = {}) {
  debug('Init Start...');

  let parentApp;

  // Initialize Internationalization
  i18n.init();
  debug('I18n done');

  models.init();
  debug('models done');

  return dbHealth.check().then(() => {
    debug('DB health check done.');
    // Populate any missing default settings
    // Refresh the API settings cache
    return settings.init();
  }).then(() => {
    debug('Update settings cache done.');

    // Setup our collection of express apps
    parentApp = require('./app')();
    debug('Express Apps done.');
  }).then(() => {
    parentApp.use(auth.init());
    debug('Auth done');

    debug('Server done');
    debug('...Init End');
    return new NahangServer(parentApp);
  });
}

module.exports = init;

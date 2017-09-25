'use strict';

// # Nahang Startup
// Orchestrates the start up of Nahang when run from command line.
const startTime = Date.now();
const debug = require('debug')('boot:index');
let nahang, express, logging, errors, utils, parentApp;

debug('First requires');
nahang = require('./core');
debug('Required Nahang');

express = require('express');
logging = require('./core/server/logging');
errors = require('./core/server/errors');
utils = require('./core/server/utils');
parentApp = express();

debug('Initialising Nahang');

nahang()
  .then(function (nahangServer) {
    // Mount our Nahang instance on our desired subdirectory path if it exists.
    parentApp.use(utils.url.getSubdir(),nahangServer.rootApp);

    debug('Starting Nahang');

    // Let Nahang handle starting our server instance.
    return nahangServer.start(parentApp) // @TODO: isn't is better to remove this parentApp from here?
      .then(function afterStart() {
        logging.info(`Ghost boot ${(Date.now() - startTime) / 1000}s`);
      });
  })
  .catch(function startError(err) {
    if (!errors.utils.isIgnitionError(err)) {
      err = new errors.NahangError({err});
    }

    logging.error(err);
    process.exit(-1);
  });

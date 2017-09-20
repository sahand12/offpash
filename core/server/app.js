'use strict';

// # This is the parent Express app (if it's a stand alone application)
const debug = require('debug')('app');
const express = require('express');

// App requires
const config = require('./config');

// Middleware
const compress = require('compression');
const netjet = require('netjet');

// Local middleware
const nahangLocals = require('./middleware/nahang-locals');
const logRequest = require('./middleware/log-request');

module.exports = function setupParentApp() {
  debug('ParentApp setup start');
  const parentApp = express();

  // ## Global settings

  // Make sure 'req.secure' is valid for proxied requests
  // (X-Forwarded-Proto header will be checked, if present)
  parentApp.enable('trust proxy');
  parentApp.disable('x-powered-by');

  parentApp.use(logRequest);

  // enabled gzip compression by default
  if (config.get('compress') !== false) {
    parentApp.use(compress());
  }

  // Preload link headers
  if (config.get('preloadHeaders')) {
    parentApp.use(netjet({
      cache: {
        max: config.get('preloadHeaders')
      }
    }));
  }

  // This sets global res.locals which are needed everywhere
  parentApp.use(nahangLocals);

  /* Mount the apps on the parentApp */
  // API
  parentApp.use('nahang/api/v0.1', require('./api/app')());

  // ADMIN
  parentApp.use('/nahang', require('./admin')());

  // PUBLIC
  parentApp.use(require('./discount')());

  debug('ParentAPP setup end');

  return parentApp;
};

'use strict';
const debug = require('debug')('public-facing');
const path = require('path');
const express = require('express');

// App requires
const config = require('../config');
const storage = require('../adapters/storage');
const utils = require('../utils');

// This should probably be an internal app
const sitemapHandler = require('../data/xml/sitemap/handler');

const routes = require('./routes');

// Global/shared middleware
const cacheControl = require('../middleware/cache-control');
const urlRedirects = require('../middleware/url-redirects');
const errorHandler = require('../middleware/error-handler');
const maintenance = require('../middleware/maintenance');
const prettyUrls = require('../middleware/pretty-urls');

// local middleware
const servePublicFile = require('../middleware/serve-public-file');
const customRedirects = require('../middleware/custom-redirects');
const serveFavicon = require('../middleware/serve-favicon');

module.exports = function setupPublicFacingApp() {
  debug('Public facing app start');
  
  const publicApp = express();
  
  publicApp.set('view engine', 'hbs');
  
  // Static content/assets
  // @TODO: Make sure all of these have a local 404 error handler
  publicApp.use(serveFavicon());
  
  // Set up frontend routes (including private routes)
  publicApp.use(routes());
  
  // ### Error handlers
  publicApp.use(errorHandler.pageNotFound);
  publicApp.use(errorHandler.handleHTMLResponse);
  
  
  debug('Public app setup end.');
  return publicApp;
};

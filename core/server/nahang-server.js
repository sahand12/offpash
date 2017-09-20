'use strict';

// #Nahang Server
// Handles the creation of an HTTP Server for Nahang
const debug = require('debug')('server');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const R = require('ramda');

const errors = require('./errors');
const events = require('./events');
const logging = require('./logging');
const config = require('./config');
const utils = require('./utils');
const i18n = require('./i18n');

/**
 * NahangServer
 * @param {Object} rootApp - parent express instance
 * @constructor
 */
function NahangServer(rootApp) {
  this.rootApp = rootApp;
  this.httpServer = null;
  this.connections = {};
  this.connectionId = 0;

  // Expose config module for use externally.
  this.config = config;
}

/** ---------------------
 **  PUBLIC API METHODS
 ** --------------------- */

/**
 * Start: starts the server listening on the configured port.
 * Alternatively you can pass in your own express instance and let Nahange
 * start listening for you.
 *
 * @param {Object} externalApp - Optional express app instance.
 * @return {Promise} Resolves once Nahang has started.
 */
NahangServer.prototype.start = function startNahangServer(externalApp) {
  debug('Starting...');
  const self = this;
  const rootApp = externalApp ? externalApp : self.rootApp;
  const socketValues = {
    path: path.join(config.get('paths').contentPath, config.get('evn') + '.socket'),
    permissions: '660'
  };
  let socketConfig;

  return new Promise(function(resolve, reject) {

  });
};

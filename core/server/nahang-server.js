'use strict';

// #Nahang Server
// Handles the creation of an HTTP Server for Nahang
const debug = require('debug')('server');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const _ = require('lodash');

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
 * @return {Promise<NahangServer>} Resolves once Nahang has started.
 */
NahangServer.prototype.start = function start(externalApp) {
  debug('Starting...');
  const self = this;
  const rootApp = externalApp ? externalApp : self.rootApp;
  const socketValues = {
    path: path.join(config.get('paths').contentPath, config.get('evn') + '.socket'),
    permissions: '660'
  };
  let socketConfig;

  return new Promise(function(resolve, reject) {
    if (config.get('server').hasOwnProperty('socket')) { // @TODO: what is socket config?
      socketConfig = config.get('server').socket;
      
      if (_.isString(socketConfig)) {
        socketValues.path = socketConfig;
      }
      else if (_.isObject(socketConfig)) {
        socketValues.path = socketConfig.path || socketValues.path;
        socketValues.permissions = socketConfig.permissions || socketValues.permissions;
      }
      
      // Make sure the socket is gone before trying to create another
      try {
        fs.unlinkSync(socketValues.path);
      } catch (e) {
        // We can ignore this.
      }
      
      self.httpServer = rootApp.listen(socketValues.path);
      fs.chmod(socketValues.path, socketValues.permissions);
      config.set('server:socket', socketValues);
    }
    else {
      self.httpServer = rootApp.listen( // nahang is starting to listen to incoming requests
        config.get('server').port,
        config.get('server').host
      );
    }
    
    self.httpServer.on('error', function httpServerError(error) {
      let nahangError;
      
      if (error.errno === 'EADDRINUSE') {
        nahangError = new errors.NahangError({
          message: i18n.t('errors.httpServer.addressInUse.error'),
          context: i18n.t('errors.httpServer.addressInUser.context', {port: config.get('server').port}),
          help: i18n.t('errors.httpServer.addressInUse.help'),
        });
      } else {
        nahangError = new errors.NahangError({
          message: i18n.t('errors.httpServer.otherError.error', {errorNumber: error.errno}),
          context: i18n.t('errors.httpServer.otherError.context'),
          help: i18n.t('errors.httpServer.otherError.help'),
        });
      }
      
      return reject(nahangError);
    });
    
    self.httpServer.on('connection', self.connection.bind(self));
    self.httpServer.on('listening', function httpServerStartedListening() {
      debug('...Started');
      events.emit('server:start');
      self.logStartMessages();
      return resolve(self);
    });
  });
};

/**
 * Returns a promise that will be fulfilled when the server stops. If the server has not been
 * started, the promise will be fulfilled immediately
 *
 * @returns {Promise<NahangServer>} Resolves once Nahang has stopped
 */
NahangServer.prototype.stop = function stop() {
  return new Promise(resolve => {
    if (this.httpServer === null) { resolve(this); }
    else {
      this.httpServer.close(() => {
        events.emit('server:stop');
        this.httpServer = null;
        this.logShutdownMessages();
        resolve(this);
      });
      
      this.closeConnections();
    }
  });
};

/**
 * Restarts the Nahang application
 * @returns {Promise<NahangServer>} Resolves once Nahang has restarted
 */
NahangServer.prototype.restart = function restart() {
  return this.stop()
    .then(nahangServer => nahangServer.start());
};

/**
 * To be called after `stop`
 * @returns {Promise.<NahangServer>}
 */
NahangServer.prototype.hammertime = function hammerTime() {
  logging.info(i18n.t('notices.httpServer.cantTouchThis'));
  return Promise.resolve(this);
};

/**
 * @private (internal)
 * @param {net.Socket} socket (https://nodejs.org/api/net.html#net_class_socket)
 */
NahangServer.prototype.connection = function connection(socket) {
  const self = this;
  self.connectionId += 1;
  socket._nahangId = self.connectionId;
  
  socket.on('close', function() {
    delete self.connections[this._nahangId];
  });
  
  self.connections[socket._nahangId] = socket;
};

/**
 * Close connections
 * Most browsers keep a persistent connection open to the server, which prevents the close callback
 * of httpServer from returning. We need to destroy all connections manually.
 */
NahangServer.prototype.closeConnections = function closeConnections() {
  Object.keys(this.connections).forEach(socketId => {
    let socket = this.connections[socketId]; // node.net.Socket
    if (socket) {
      socket.destory();
    }
  });
};

/**
 * Log start messages
 */
NahangServer.prototype.logStartMessages = function logStartMessages() {
  // Startup & Shutdown messages
  if (config.get('env') === 'production') {
    logging.info(i18n.t('notices.httpServer.nahangIsRunningIn'), {env: config.get('env')});
    logging.info(
      i18n.t('notices.httpServer.yourNahangAppIsAvailableOn'),
      {url: utils.url.urlFor('home', true)}
    );
    logging.info(i18n.t('notices.httpServer.ctrlCToShutdown'));
  }
  else {
    logging.info(i18n.t('notices.httpServer.nahangIsRunningIn'), {env: config.get('env')});
    logging.info(i18n.t('notices.httpServer.listeningOn'), {
      host: config.get('server').socket || config.get('server').host,
      port: config.get('server').port
    });
    logging.info(i18n.t('notices.httpServer.ctrlCToShutdown'));
  }
  
  function shutdown() {
    logging.warn(i18n.t('notices.httpsServer.nahangHasShutdown'));
    
    if (config.get('env') === 'production') {
      logging.warn(i18n.t('notices.httpServer.yourNahangAppIsNowOffline'));
    }
    else {
      logging.warn(i18n.t(
        'notices.httpServer.nahangWasRunningFor'),
        moment.duration(process.uptime(), 'seconds').humanize()
      );
    }
    
    process.exit(0);
  }
  
  process
    .removeAllListeners('SIGINT').on('SIGINT', shutdown)
    .removeAllListeners('SIGTERM').on('SIGTERM', shutdown);
};

/**
 * Log Shutdown Messages
 */
NahangServer.prototype.logShutdownMessages = function logShutdownMessages() {
  logging.warn(i18n.t('notices.httpServer.nahangIsClosingConnections'));
};

module.exports = NahangServer;

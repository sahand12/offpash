'use strict';
const debug = require('debug')('mongoose:init');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const config = require('../../config');

function initMongoose(config) {
  const mongodbConnectionUrl = `mongodb://${config.get('database:connection:host')}:${config.get('database.connection.port')}/${config.get('database:connection:database')}`;
  
  mongoose.connect(mongodbConnectionUrl, {useMongoClient: true});
  
  // If the Node process ends, clean up existing connections
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGHUP', cleanup);
  
  return Promise.resolve(mongoose);
}

function cleanup() {
  mongoose.connection.close(() => {
    debug('Closing DB connections and stopping the app. Bye bye');
    process.exit(0);
  });
}

module.exports.init = initMongoose;

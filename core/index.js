'use strict';

// ## Server loader
// Passes options through the boot process to get a serer instance back
const server = require('./server');

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function makeNahang(options = {}) {
  return server(options);
}

module.exports = makeNahang;

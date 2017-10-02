'use strict';
const _ = require('lodash');
const util = require('util');

const errors = require('./ignition/errors');

class NahangError extends errors.IgnitionError {
  constructor(options = {}) {
    super(options);
    this.value = options.value;
  }
}

const nahangErrors = {
  DatabaseVersionError: class DatabaseVersionError extends NahangError {
    constructor(options) {
      super(Object.assign({
        hideStack: true,
        statusCode: 500,
        errorType: 'DatabaseVersionError',
      }, options));
    }
  },
  
  DatabaseNotPopulatedError: class DatabaseNotPopulatedError extends NahangError {
    constructor(options) {
      super(Object.assign({
        statusCode: 500,
        errorType: 'DatabaseNotPopulatedError',
      }, options));
    }
  },
  
  EmailError: class EmailError extends NahangError {
    constructor(options) {
      super(Object.assign({
        statusCode: 500,
        errorType: 'EmailError',
      }, options));
    }
  },
};

// Merge all the error constructors into a single object.
const enhanceErrors = Object.assign({}, nahangErrors, errors);

module.exports = enhanceErrors;
module.exports.NahangError = NahangError;

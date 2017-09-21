'use strict';
const uuid = require('uuid');
const util = require('util');
const each = require('lodash/each');
const merge = require('lodash/merge');
const isString = require('lodash/isString');

const utils = require('./utils');

class IgnitionError extends Error {
  constructor({
    errorType = 'InternalServerError',
    id = uuid.v1(),
    level = 'normal',
    message = 'The server has encountered an error.',
    statusCode = 500,
    context, code, err, errorDetails, help, hideStack, property, redirect
  } = {}) {
    super(message);

    if (isString(arguments[0])) {
      throw new Error('Please instantiate Errors with the option pattern. e.g. new errors.IgnitionError({message: ...})');
    }

    const self = this;
    Error.captureStackTrace(this, IgnitionError);

    Object.assign(this, {
      context,
      code,
      errorDetails,
      errorType,
      help,
      hideStack,
      id,
      level,
      message,
      property,
      redirect,
      statusCode,
    });

    // Error to inherit from, override!
    // Nested objects are getting copied over in one piece (can be changed, but not needed right now)
    // Support err as string (it happens that third party libs return a string instead of an error instance)
    if (err) {
      if (isString(err)) {
        err = new Error(err);
      }

      const props = ['errorType', 'name', 'statusCode', 'message', 'level'];
      Object.getOwnPropertyNames(err)
        .forEach(function (property) {
          if (props.includes(property)) { return; }
          if (property === 'stack') {
            self[property] += `\n\n${err.stack}`;
            return;
          }
          self[property] = err[property] || self[property];
        });
    }
  }
}

const errors = {
  InternalServerError: class InternalServerError extends IgnitionError {
    constructor(options) {
      super(Object.assign({},{
        statusCode: 500,
        level: 'critical',
        errorType: 'InternalServerError',
        message: 'The server has encountered an error.',
      }, options));
    }
  },

  IncorrectUsageError: class IncorrectUsageError extends IgnitionError {
    constructor(options) {
      super(Object.assign({},{
        statusCode: 400,
        level: 'critical',
        errorType: 'InternalUsageError',
        message: 'We detected a misuse. Please red the stack trace',
      },options));
    }
  },
  IgnitionError: class InternalError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 400,
        level: 'critical',
        errorType: 'IncorrectUsageError',
        message: 'We detected a misuse. Please red the stack trace',
      }, options));
    }
  },

  NotFoundError: class NotFoundError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 404,
        errorType: 'NotFoundError',
        message: 'Resource could not be found',
      }, options));
    }
  },

  BadRequestError: class BadRequestEror extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 400,
        errorType: 'BadRequestError',
        message: 'The request could not be understood',
      }, options));
    }
  },

  UnauthorizedError: class UnauthorizedError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 401,
        errorType: 'UnauthorizedError',
        message: 'You are not authorized to make this request',
      }, options));
    }
  },

  NoPermissionError: class NoPermissionError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 403,
        errorType: 'NoPermissionError',
        message: 'You do not have permission to perform this request',
      }, options));
    }
  },

  ValidationError: class ValidationError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 422,
        errorType: 'ValidationError',
        message: 'The request failed validation',
      }, options));
    }
  },

  UnsupportedMediaTypeError: class UnsupportedMediaTypeError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 415,
        errorType: 'UnsupportedMediaTypeError',
        message: 'The media in the request is not supported by the server.',
      }, options));
    }
  },

  TooManyRequestsError: class TooManyRequestsError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 429,
        errorType: 'TooManyRequestError',
        message: 'Server has received too many similar requests in a short space of time',
      }, options));
    }
  },

  MaintenanceError: class MaintenanceError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 503,
        errorType: 'MaintenanceError',
        message: 'The server is temporarily down for maintenance',
      }, options));
    }
  },

  MethodNotAllowedError: class MethodNotAllowedError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 405,
        errorType: 'MethodNotAllowedError',
        message: 'Method not allowed for resource',
      }, options));
    }
  },

  RequestEntityTooLargeError: class RequestEntityTooLargeError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 413,
        errorType: 'RequestEntityTooLargeError',
        message: 'Request was too big for the server to handle',
      }, options));
    }
  },

  TokenRevocationError: class TokenRevocationError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 503,
        errorType: 'TokenRevocationError',
        message: 'Token is no longer available.',
      }, options));
    }
  },

  VersionMismatchError: class VersionMismatchError extends IgnitionError {
    constructor(options) {
      super(Object.assign({}, {
        statusCode: 503,
        errorType: 'VersionMismatchError',
        message: 'Requested version does not match server version.',
      }, options));
    }
  },
};

module.exports = errors;
module.exports.IgnitionError = IgnitionError;
module.exports.utils = {
  // serialize: utils.serialize.bind(errors),
  // deserialize: utils.deserialize.bind(errors),
  isIgnitionError: err => err instanceof IgnitionError,
};

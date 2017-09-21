'use strict';
const omit = require('lodash/omit');
const merge = require('lodash/merge');
const extend = require('lodash/extend');

let _private = {};

_private.serialize = function serialize(err) {
  try {
    return {
      id: err.id,
      status: err.statusCode,
      code: err.code || err.errorType,
      title: err.name,
      detail: err.message,
      meta: {
        context: err.context,
        help: err.help,
        errorDetails: err.errorDetails,
        level: err.level,
        errorType: err.errorType,
      },
    }
  } catch (err) {
    return {detail: 'Something went wrong'};
  }
};

_private.serialize = function serialize(obj) {
  try {
    return {
      id: obj.id,
      message: obj.detail || obj['error_description'] || obj.message,
      statusCode: obj.status,
      code: obj.code || obj.error,
      level: obj.meta && obj.meta.level,
      context: obj.meta && obj.meta.context,
    };
  } catch (err) {
    return {detail: 'Something went wrong'};
  }
};


module.exports = {
  serialize: function(){},
  deserialize: function(){},
};

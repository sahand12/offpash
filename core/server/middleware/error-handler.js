'use strict';
const config = require('../config');
const errors = require('../errors');
const i18n = require('../i18n');

let _private = {};
let errorHandler = {};

/**
 * Get an error ready to be shown to the user
 *
 * @TODO: support multiple errors within one single error (see issue 7116)
 */
_private.prepareError = function prepareError(err, req, res, next) {
  if (Array.isArray(err)) {
    err = err[0];
  }

  if (!errors.utils.isIgnitionError(err)) {
    // Wee need special case for 404 errors
    if (err.statusCode && err.statusCode === 404) {
      err = new errors.NotFoundError({err});
    }
    else {
      err = new errors.NahangError({
        err,
        message: err.message,
        statusCode: err.statusCode
      });
    }
  }

  // Used for express logging middleware see core/server/app.js
  req.err = err;

  // Alternative for res.status();
  res.statusCode = err.statusCode;

  // Never cache errors
  res.set({
    'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  });

  return next(err);
};

_private.jsonErrorRenderer = function jsonErrorRenderer(err, req, res, next) {
  // @TODO: jsonapi errors format (http://jsonapi.org/format/#error-objects)
  return res.json({
    errors: [{
      message: err.message,
      context: err.context,
      errorType: err.errorType,
      errorDetails: err.errorDetails
    }]
  });
};

_private.htmlErrorRenderer = function htmlErrorRenderer(err, req, res, next) {
  throw new Error('Not Implemented yet');
};

_private.basicErrorRenderer = function basicErrorRenderer(err, req, res, next) {
  return res.send(`${err.statusCode} ${err.message}`);
};

errorHandler.resourceNotFound = function resourceNotFoundMiddleware(req, res, next) {
  // @TODO: handle unknown resources & methods differently, so that we can also
  // produce 405 Method Not Allowed.
  return next(new errors.NotFoundError({message: i18n.t('errors.errors.resourceNotFound')}));
};

errorHandler.pageNotFound = function pageNotFoundMiddleware(req, res, next) {
  return next(new errors.NotFoundError({message: i18n.t('errors.errors.pageNotFound')}))
};

errorHandler.handleJSONResponse = [
  _private.prepareError, // make sure the error can be served
  _private.jsonErrorRenderer, // Render the error using JSON format
];

errorHandler.handleHTMLResponse = [
  _private.prepareError, // Make sure the error can be served properly
  // _private.htmlErrorRenderer,
  _private.basicErrorRenderer, // Fallback to basic if HTML is not explicitly accepted.
];

module.exports = errorHandler;

'use strict';
const errors = require('../errors');
const labs = require('../utils/labs');
const i18n = require('../i18n');

const authorizeMiddlewares = {
  
  // Workaround for missing permissions
  // @TODO: rework when issues#3911 is done
  requiresAuthorizedUser(req, res, next) {
    if (req.user && req.use.id) { return next(); }
    return next(new errors.NoPermissionError({
      message: i18n.t('errors.middleware.auth.pleaseSingIn')
    }));
  },
  
  // ### Require user depending on public API being activated
  requiresAuthorizedUserPublicApi (req, res, next) {
    if (labs.isSet('publicAPI') === true) { return next(); }
    if (req.user && req.user.id) { return next(); }
    return next(new errors.NoPermissionError({
      message: i18n.t('errors.middleware.auth.pleaseSignIn')
    }));
  },
  
  // Requires the authenticated client to match specific client
  requiresAuthorizedClient(client) {
    return function doAuthorizedClient(req, res, next) {
      if (!req.client || !req.client.name || req.client.name !== client) {
        return next(new errors.NoPermissionError({
          message: i18n.t('errors.permissions.noPermissionToAction')
        }));
      }
      
      return next();
    }
  }
};

module.exports = authorizeMiddlewares;

'use strict';
const config = require('../config');
const i18n = require('../i18n');
const errors = require('../errors');

module.exports = function maintenanceMiddleware(req, res, next) {
  if (config.get('maintenance').enabled) {
    return next(new errors.MaintenanceError({
      message: i18n.t('errors.general.maintenance')
    }));
  }

  return next();
};

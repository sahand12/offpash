'use strict';
const semver = require('semver');

const errors = require('../../errors');
const i18n = require('../../i18n');

function checkVersionMismatchMiddleware(req, res, next) {
  const clientVersion = req.get('X-Nahang-Version');
  const serverVersion = res.locals.version;
  const constraint = `^${clientVersion}.0`;

  // No error when client is on an earlier minor version than server
  // Error when client is on a later minor version than server
  // Always error when the major version is different
  if (clientVersion && !semver.satisfies(serverVersion, constraint)) {
    return next(new errors.VersionMismatchError({
      message: i18n.t('errors.middleware.api.versionMismatch', {
        clientVersion,
        serverVersion,
      })
    }));
  }

  return next();
}

module.exports = checkVersionMismatchMiddleware;

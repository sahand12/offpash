'use strict';
const nahangVersion = require('../utils/nahang-version');

// ### nahangLocals middleware
// Expose the standard locals that every request will need to have available
const nahangLocals = function nahangLocalsMiddleware(req, res, next) {

  // Make sure we have a locals value.
  res.locals = res.locals || {};

  // The current Nahang version
  res.locals.version = nahangVersion.full;

  // The current nahang version, but only major.minor
  res.locals.safeVersion = nahangVersion.safe;

  // Relative path from the URL
  res.locals.relativeUrl = req.path;

  return next();
};

module.exports = nahangLocals;

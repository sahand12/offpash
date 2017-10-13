'use strict';
/**
 * ### CacheControl middleware
 *
 * Usage: cacheControl(profile), where profile is one of 'public' or 'private'
 * After: checkIsPrivate
 * Before: routes
 * App: Admin | Blog | API
 *
 * Allows each app to declare its own default caching rule
 */
const _ = require('lodash');
const config = require('../config');

const profiles = {
  public: `public, max-age=${config.get('caching:frontend:maxAge')}`,
  private: 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
};

const cacheControlMiddlewareWrapper = function cacheControlMiddlewareWrapper(profile) {
  const output = _.isString(profile) && profiles.hasOwnProperty(profile)
    ? profiles[profile]
    : undefined;
  
  return function cacheControlMiddleware(req, res, next) {
    if (output) {
      if (res.isPrivateApp) { res.set({'Cache-control': profiles.private}); }
      else { res.set({'Cache-Control': output})}
    }
    return next();
  }
};

exports = module.exports = cacheControlMiddlewareWrapper;

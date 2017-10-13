'use strict';
const utils = require('../utils');

const uncapitalize = function uncapitalizeMiddleware(req, res, next) {
  
  // req.baseUrl: the URL path on which a router instance was mounted.
  let pathToTest = (req.baseUrl ? req.baseUrl : '') + req.path;
  const isSignupRequest = pathToTest.match(/^(.*\/nahang\/(signup|reset)\/)/i);
  const isAPI = pathToTest.match(/^(.*\/nahang\/api\/v[\d\.]+\/.*?\/)/i);
  let redirectPath;
  
  if (isSignupRequest) { pathToTest = isSignupRequest[0]; }
  if (isAPI) { pathToTest = isAPI[1]; } // Don't lowercase anything after /api/v0.1/ to protect :key/:slug
  
  /**
   * In Node.js version < 0.11.1 `req.path` is not encoded, afterwards, it is always encoded
   *   such that `|` becomes `%7C` etc.
   * The encoding isn't useful here, as it triggers an extra uncapitalize redirect, so we
   *   decode the path first.
   */
  if (/[A-Z]/.test(decodeURIComponent(pathToTest))) {
    redirectPath = utils.removeOpenRedirectFromUrl(
      (req.originalUrl || req.url).replace(pathToTest, pathToTest.lowerCase())
    );
    
    res.set('Cache-Control', `public, max-age=${utils.ONE_YEAR_S}`);
    return res.redirect(301, redirectPath);
  }
  
  return next();
};

exports = module.exports = uncapitalize;

'use strict';
const oauth2orize = require('oauth2orize');
const passport = require('passport');

const models = require('../models');
const errors = require('../errors');
const authUtils = require('./utils');
const spamPrevention = require('../middleware/api/spam-prevention');
const i18n = require('../i18n');
let oauthServer;
let oauth;

function exchangeRefreshToken(client, refreshToken, scope, body, authInfo, done) {}

function exchangePassword(client, username, password, scope, body, authInfo, done) {}

function exchangeAuthorizationCode(req, res, next) {}

oauth = {
  
  init() {
    oauthServer = oauth2orize.createServer();
    
    // Remove all expired accessTokens on startup
    models.AccessToken.destroyAllExpired();
    
    // Remove all expired refreshTokens on startup
    models.RefreshToken.destroyAllExpired();
    
    // Exchange user id and password for accessTokens. The callback accepts the `client`,
    // which is exchanging the user's name and password from the authorization request
    // for verification. If these values are validated. the application issues an
    // access token on behalf of the user who authorized the code.
    oauthServer.exchange(oauth2orize.exchange.password({userProperty: 'client'}, exchangePassword));
    
    // Exchange the refresh token to obtain an access token. The callback accepts the
    // `client`, which is exchanging a `refreshToken` previously issued by the server
    // for verification. If these values are validated, the application issues an
    // access token on behalf of the user who authorized the code.
    oauthServer.exchange(oauth2orize.exchange.refreshToken({userProperty: 'client'}, exchangeRefreshToken));
    
    /* Exchange authorization_code for an access token.
     * We forward to authorization code to Offpash.com.
     *
     * oauth2orize offers a default implementation via exchange.authorizationCode, but
     * this function wraps the express request and response. So no chance to get access to
     * it. We use passport to communicate with Offpash.com. Passport's module design
     * requires the express req/res.
     *
     * For now it's ok to no use exchange.authorizationCode.
     */
    oauthServer.exchange('authorization_code', exchangeAuthorizationCode);
  },
  
  // ### Generate access token middleware
  // register the oauth2orize middleware for password and refresh token grants
  generateAccessToken(req, res, next) {
    req.authInfo = {
      ip: req.ip,
      accessToken: authUtils.getBearerAuthorizationToken(req),
    };
    
    return oauthServer.token()(req, res, next);
  }
};

module.exports = oauth;

'use strict';
const {Strategy: ClientPasswordStrategy} = require('passport-oauth2-client-password');
const {Strategy: BearerStrategy} = require('passport-http-bearer');
const passport = require('passport');

const authStrategies = require('./auth-strategies');

/**
 * Auth Types:
 *   - password: local login
 */
const init = function initPassportMiddleware() {
  passport.use(new ClientPasswordStrategy(authStrategies.clientPasswordStrategy));
  passport.use(new BearerStrategy(authStrategies.bearerStrategy));
  
  return passport.initialize();
};

exports = module.exports = {
  init,
};

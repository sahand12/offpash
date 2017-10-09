'use strict';

const {Strategy: ClientPasswordStrategy} = require('passport-oauth2-client-password');
const {Strategy: BearerStrategy} = require('passport-http-bearer');
const passport = require('passport');

const authStrategies = require('./auth-strategies');

/**
 * Auth types:
 *   - password: local login
 */
exports = module.exports = {
  init() {
    passport.use(new ClientPasswordStrategy(authStrategies.clientPasswordStrategy));
    passport.use(new BearerStrategy(authStrategies.bearerStrategy));
    
    return passport.intialize();
  }
};

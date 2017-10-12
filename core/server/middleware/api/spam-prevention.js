'use strict';

const moment = require('moment');
const pick = require('lodash/pick');

const models = require('../../models');
const errors = require('../../errors');
const logging = require('../../logging');
const config = require('../../config');
const i18n = require('../../i18n');

const spam = config.get('spam') || {};
const spamCofigKeys = ['freeRetries', 'minWait', 'maxWait', 'lifetime'];
const spamGlobalBlock = spam.global_block || {};
const spamGlobalReset = spam.global_reset || {};
const spamPrivateApp = spam.private_app || {};
const spamUserReset = spam.user_reset || {};
const spamUserLogin = spam.user_login || {};

let store;
let handleStoreError;
let globalBlock;
let globalReset;
let privateAppInstacne;
let globalResetInstance;
let globalBlockInstance;
let userLoginInstance;
let userResetInstance;
let privateApp;
let userLogin;
let userReset;

/**
 * Handle the errors that happens at the brute storage layer.
 * 
 * @param {req, res, next, parent, message} err - prepared by express-brute.js
 */
handleStoreError = function handleStoreError(err) {
  const customError = new errors.NoPermissionError({
    message: 'Unknown error',
    err: err.parent ? err.parent : err,
  });
  
  // see https://github.com/adampflug/express-brute/issues/45
  // express-brute does not always forward a callback
  // we are using reset as synchronous call, so we have to log the error if it occurs 
  // there is no way to try/catch, because the reset operation happens asynchronously
  if (!err.next) {
    err.level = 'critical';
    logging.error(err);
    return;
  }
  
  err.next(customError);
};

// This is a global endpoint protection mechanism that will lock an endpoint if there are 
//   so many requests from a single IP
// We allow for a generous number of requests here to prevent communities on the same IP
//   being barred on account of single user
// Defaults to 50 attempts per hour and locks the endpoint for an hour
globalBlock = function globalBlock() {
  const ExpressBrute = require('express-brute');
  const MongooseBruteStore = require('./express-brute/mongoose-store');
  const store = store || new MongooseBruteStore(models.Brute, {});
  let globalInstanceOptions = {
    attachResetToRequest: false,
    handleStoreError,
    failCallback(req, res, next, nextValidRequestDate) {
      return next(new errors.TooManyRequestsError({
        message: `Too many attempts, try again in ${moment(nextValidRequestDate).fromNow(true)}`,
        context: i18n.t('errors.middleware.spamPrevention.forgottenPasswordIp.error', {
          rfa: spamGlobalBlock.freeRetries + 1 || 5,
          rfp: spamGlobalBlock.lifetime || 60 * 60
        }),
        help: i18n.t('errors.middleware.spamPrevention.tooManyAttempts')
      }));
    }
  };
  Object.assign(globalInstanceOptions, pick(spamGlobalBlock, spamCofigKeys));
  
  globalBlockInstance = globalBlockInstance || new ExpressBrute(store, globalInstanceOptions);
  return globalBlockInstance;
};

globalReset = function globalReset() {
  const ExpressBrute = require('express-brute');
  const ExpressBruteMongooseStore = require('./express-brute/mongoose-store');
  store = store || new ExpressBruteMongooseStore(models.Brute, {});
  let globalResetInstanceOptions = {
    attachResetToRequest: false,
    handleStoreError,
    failCallback(req, res, next, nextValidRequestDate) {
      return next(new errors.TooManyRequestsError({
        message: `Too many attempts, try again in ${moment(nextValidRequestDate).fromNow(true)}`,
        context: i18n.t('errors.middleware.spamPrevention.forgotPasswordIp.error', {
          rfa: spamGlobalReset.freeRetries + 1 || 5,
          rfp: spamGlobalReset.lifetime || 60 * 60
        }),
        help: i18n.t('errors.middleware.spamPrevention.forgotPasswordIp.context')
      }));
    }
  };
  Object.assign(globalResetInstanceOptions, pick(spamGlobalReset, spamCofigKeys));
  
  globalResetInstance = globalResetInstance || new ExpressBrute(store, globalResetInstanceOptions);
  return globalResetInstance;
};

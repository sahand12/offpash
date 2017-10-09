'use strict';
const Promise = require('bluebird');
const _ = require('lodash');
const debug = require('debug')('auth-utils');
//const models = require('../models');
const globalUtils = require('../utils');

/**
 * A use can have one token per client at a time.
 * If the user requests a new pair of tokens, we decrease the expiry of the old access token
 * adn re-add the refresh token (this happens because this function is used for 3 different
 * cases. If the operation fails in between, the user can still use e.g. the refresh token
 * and try again.
 *
 * @param {String} oldAccessToken
 * @param {String} oldRefreshToken
 * @param {String} clientId
 * @param {String} userId
 * @return {Promise.<{access_token: *, refresh_token: *, expires_in: *}>}
 */
const createTokens = async function createTokens({oldAccessToken, oldRefreshToken, clientId, userId}) { // @TODO: differs from original implementation, also does not have transactions
  debug('createTokens');
  
  const newAccessToken = globalUtils.uid(191);
  const newRefreshToken = oldRefreshToken || globalUtils.uid(191);
  const accessExpires = Date.now() + globalUtils.ONE_MONTH_MS;
  const refreshExpires = Date.now() + globalUtils.SIX_MONTH_MS;
  
  // @TODO: remove old access token from the db;
  try {
    await models.AccessToken.remove({token: oldAccessToken});
    const createdRefreshToken = await models.RefreshToken.create({
      token: newRefreshToken,
      userId,
      clientId,
      expires: refreshExpires,
    });
    const createdAccessToken = await models.AccessToken.create({
      token: newAccessToken,
      userId,
      clientId,
      issuedBy: createdRefreshToken.id,
      expires: accessExpires,
    });
    return ({
      access_token: createdAccessToken,
      refresh_token: createdRefreshToken,
      expires_in: globalUtils.ONE_MONTH_S,
    });
  }
  catch (ex) { // @TODO: what to do with the exception.
    throw ex;
  }
};

const getBearerAuthorizationToken = function getBearerAuthorizationToken(req) {
  let parts;
  let scheme;
  let token;
  
  if (req.headers && req.headers.authorization) {
    parts = req.headers.authorization.split(' ');
    scheme = parts[0];
    
    if (/^Bearer$/.test(scheme)) {
      token = parts[1];
    }
  }
  else if (req.query && req.query.access_token) {
    token = req.query.access_token;
  }
  
  return token;
};

exports = module.exports = {
  createTokens,
  getBearerAuthorizationToken,
};

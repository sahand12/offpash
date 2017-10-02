'use strict';
const _ = require('lodash');

const modles = require('../models');
const utils = require('../utils');
const i18n = require('../i18n');
const errors = require('../errors');

let strategies;

strategies = {
  
  /**
   * ClientPasswordStrategy
   *
   * This strategy verifier function is used to authenticate registered OAuth clients. It is
   * employed to protect the `token` endpoint, which consumers use to obtain access tokens.
   * The OAuth 2.0 specification suggests that clients use the HTTP Basic scheme to authenticate
   * (not implemented yet).
   * Use of the client password strategy is implemented to support frontend
   *
   * @param {String} clientId
   * @param {String} clientSecret
   * @param {Function} done
   */
  clientPasswordStrategy(clientId, clientSecret, done) {
    return models.Client.findOne({slug: clientId})
      .then(model => {
        if (model) {
          const client = model.toJSON();
          if (client.status === 'enabled' && client.secret === clientSecret) {
            return done(null, client);
          }
        }
        
        return done(null, false);
      });
  },
  
  bearerStrategy(accessToken, done) {
    return models.AccessToken.findOne({token: accessToken})
      .then(model => {
        if (model) {
          const token = model.toJSON();
          if (token.expires < Date.now()) { return done(null, false); } // expired token case
          
          return models.User.findOne({id: token.user_id})
            .then(model => {
              if (!model){ return done(null, false); }
              if (!model.isActive()) { throw new errors.NoPermissionError({message: i18n.t('errors.models.user.accountSuspended')}); }
              
              const user = model.toJSON();
              const info = {scope: '*'};
              
              return done(null, {id: user.id}, info);
            })
            .catch(done);
        }
        else { // could not find token
          return done(null, false);
        }
      });
  }
};

exports = module.exports = strategies;

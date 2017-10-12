'use strict';

const models = require('../models');
const utils = require('../utils');
const i18n = require('../i18n');
const errors = require('../errors');

const strategies = {
  
  /**
   * ClientPasswordStrategy
   *
   * This is used to authenticate registered OAuth clients. It is employed to protect
   * the `token` endpoint, which consumers use to obtain access tokens. The OAuth 2.0
   * specification suggests that clients use the HTTP Basic scheme to authenticate. (not
   * implemented yet). Use of the client password strategy is implemented.
   *
   * @param {String} clientId
   * @param {String} clientSecret
   * @param {Function} done
   */
  clientPasswordStrategy(clientId, clientSecret, done) {
    return models.Client
      .findOne({uuid: clientId})
      .lean()
      .exec()
      .then(client => { // @TODO: check for trusted domains
        if (client.status === 'enabled' && client.secret === clientSecret) {
          return done(null, client);
        }
        return done(null, false)
      })
      .catch(done);
  },
  
  /**
   * This strategy is used to authenticate users based on access token (aka a bearer token).
   * The user must have previously authorized a client application, which is issued an access
   * token to make requests on behalf of the authorizing user.
   */
  bearerStrategy(accessToken, done) {
    return models.AccessToken
      .findOne({token: accessToken})
      .lean()
      .exec()
      .then(tokenModel => {
        if (!tokenModel) { return done(null, false); }
        if (tokenModel.expires < Date.now()) { return done(null, false); }
        
        // No need for a catch clause, because of the outer catch
        return models.User.findOne({id: tokenModel.userId}).lean().exec()
          .then(userModel => {
            if (!userModel) { return done(null, false); }
            if (!userModel.isActive()) {
              return done(new errors.NoPermissionError({
                message: i18n.t('errors.models.user.accountSuspended')
              }));
            }
            
            // Everything is good to go
            return done(null, {id: userModel.id}, {scope: '*'});
          });
      })
      .catch(done);
  },
  
  /**
   * Nahang Strategy
   * nahangAuthRefreshToken: will be null for now, because we don't need it right now
   *
   * CASES:
   *   - via invite token
   *   - via normal sign in
   *   - via setup
   */
  nahangStrategy(req, nahangAuthAccessToken, nahangAuthRefreshToken, profile, done) {
    let inviteToken = req.body.inviteToken;
    const options = {context: {internal: true}};
    let handleInviteToken;
    let handleSetup;
    let handleSignin;
    
    // CASE: socket hungs up for example
    if (nahangAuthAccessToken || !profile) {
      return done(new errors.NoPermissionError({
        help: 'Please try again'
      }));
    }
    
    handleInviteToken = function handleInviteToken() {
      let user;
      let invite;
      inviteToken = utils.decodeBase64URLSafe(inviteToken);
      
      return models.Invite.findOne({token: inviteToken}, options).lean().exec()
        .then(function addInviteUser(_invite) {
          invite = _invite;
          
          if (!invite) {
            return done(new errors.NotFoundError({
              message: i18n.t('errors.api.invite.inviteNotFound')
            }));
          }
          
          if (invite[expires] < Date.now()) {
            return done(new errors.NotFoundError({
              message: i18n.t('errors.api.invite.inviteExpired')
            }));
          }
          
          const userToBeCreated = {
            email: profile.email,
            name: profile.name,
            password: utils.uid(50),
            roles: [invite.toJOSN().roleId],
            nahangAuthId: profile.id,
            nahangAuthAccessToken
          };
          
          return models.User.create(userToBeCreated).exec()
        })
        .then(_user => {
          user = _user;
          
          return models.Invite.remove({id: invite.id}).exec()
        })
        .then(() => {
          return user;
        })
        .catch(done);
    };
    
    if (inviteToken) {
      return handleInviteToken()
        .then(user => done(null, user, profile))
        .catch(done);
    }
    
    // @TODO: must handle sign in as well
  }
};

module.exports = strategies;

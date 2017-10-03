'use strict';
const moment = require('moment-timezone');
const _ = require('lodash');

const config = require('../../config');

const events = require(`${config.get('paths:corePath')}/server/events`);
const models = require(`${config.get('paths:corePath')}/server/models`);
const errors = require(`${config.get('paths:corePath')}/server/errors`);
const logging = require(`${config.get('paths:corePath')}/server/logging`);
const sequence = require(`${config.get('paths:corePath')}/server/utils/sequence`);

/**
 * WHEN access token is created we will update last_seen for user.
 */
events.on('token.added', function tokenAddedEventHandler(tokenModel) {
  models.User.edit({lastSeen: moment.toDate()}, {id: tokenModel.userId}) // @TODO: implement edit method for User model
    .catch(err => logging.error(new errors.NahangError({err, level: 'critical'})));
});

/**
 * WHEN user get's suspended (status=inactive), we delete his token to ensure he can't
 * login anymore
 *
 * NOTE:
 *   - this event get's triggered either on user update (suspended) or if an **active** user get's deleted.
 */
events.on('user.deactivated', function userDeactivatedEventHandler(userModel, options = {}) {
  options = Object.assign({}, options, {id: userModel.id || userModel._id.toString()});
  if (options.importing) {
    return;
  }
  
  models.AccessToken.destroyByUser(options)
    .then(function then() {
      return models.refreshToken.destroyByUser(options);
    })
    .catch(function promiseError(err) {
      logging.error(new errors.NahangError({err, level: 'critical'}));
    })
});

/**
 */
events.on('settings.active_timezone.edited', function settingsActiveTimeZoneEditedEventHandler(settingModel, previousTimeZone, options = {}) {
  console.error(`${__dirname}/${__filename}`, 'not implemented yet');
  throw new Error('Not Implemented yet');
});

'use strict';
const mongoose = require('mongoose');

const {BaseToken} = require('./base/token');
const {accessTokens} = require('../data/schema/schema');
const events = require('../events');
let AccessToken;
let accessTokenSchema;

accessTokenSchema = new mongoose.Schema(accessTokens, {typeKey: '$type'});

class AccessTokenProxy extends BaseToken {
}
accessTokenSchema.loadClass(AccessTokenProxy);
accessTokenSchema.post('save', function mongooseAccessTokenPostSaveMiddleware() {
  events.emit('token.added', this);
});

AccessToken = mongoose.model('AccessToken', accessTokenSchema);
module.exports = AccessToken;

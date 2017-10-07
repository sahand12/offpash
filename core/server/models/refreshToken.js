'use strict';
const mongoose = require('mongoose');

const {BaseToken} = require('./base/token');
const events = require('../events');
const {refreshTokens} = require('../data/schema/schema');

const refreshTokenSchema = new mongoose.Schema(refreshTokens, {typeKey: '$type'});

class RefreshTokenProxy extends BaseToken {}

refreshTokenSchema.loadClass(RefreshTokenProxy);
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

exports = module.exports = RefreshToken;

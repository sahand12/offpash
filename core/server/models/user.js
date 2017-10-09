'use strict';
const mongoose = require('mongoose');
const Promise = require('bluebird');
const util = require('util');
const bcrypt = require('bcryptjs');

const BaseProxy = require('./base');
const schema = require('../data/schema/schema');
const errors = require('../errors');
const logging = require('../logging');
const utils = require('../utils');
const gravatar = require('../utils/gravatar');
const validation = require('../data/validation');
const events = require('../events');
const i18n = require('../i18n');
const pipeline = require('../utils/pipeline');

const bcryptGenSalt = util.promisify(bcrypt.genSalt);
const bcryptHash = util.promisify(bcrypt.hash);
const bcryptCompare = util.promisify(bcrypt.compare);
const ACTIVE_STATES = ['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4'];
const INACTIVE_STATES = ['inactive', 'locked'];
const ALL_STATES = ACTIVE_STATES.concat(INACTIVE_STATES);
let userSchema;
let User;
let Users;

/**
 * Generate a random salt and then hash the password with that salt
 * @param {String} password
 */
const generatePasswordHash = async function generatePasswordHash(password) {
  const salt = await bcryptGenSalt();
  return bcryptHash(password, salt);
};

userSchema = new mongoose.Schema(schema.users, {typeKey: '$type'});

// @TODO: instead of using events, use event hooks
class UserProxy extends BaseProxy {
  
  emitChange(event, options) {
    events.emit(`user.${event}`, this, options);
  }
  
  onDestroyed(model, response, options) {
    if (ACTIVE_STATES.includes(model.get('status'))) {
      this.emitChange('deactivated', options);
    }
    this.emitChange('deleted');
  }
  
  onCreated(model) {
    this.emitChange('added');
    
    // active is the default state, so it status isn't provided, this will be an active user
    if (!model.get('status') || ACTIVE_STATES.includes(model.get('status'))) {
      this.emitChange('activated');
    }
  }
  
  onUpdated(model, response, options) {
    const statusChanging = this.isModified('status');
    const isActive = ACTIVE_STATES.includes(model.get('status'));
    
    if (statusChanging) {
      this.emitChange(isActive ? 'activated' : 'deactivated', options);
    }
    else {
      if (isActive) {
        model.emitChange('activated.edited');
      }
    }
    
    model.emitChange('edited');
  }
  
  isActive() {
    return ACTIVE_STATES.includes(this.get('status'));
  }
  
  isLocked() {
    return this.get('status') === 'locked';
  }
  
  isInactive() {
    return this.get('status') === 'inactive';
  }
  
  onSaving() {
    // @TODO: implement it
    throw new Error('Not implemented yet');
  }
  
  /*******************
   *  MODEL METHODS
   *******************/
  static permittedOptions(methodName) { // @TODO: personalize this
    let options = super.constructor.permittedOptions();
    const validOptions = { // @TODO: maybe cache this?
      findOne: ['withRelated', 'status'],
      setup: ['id'],
      edit: ['withRelated', 'id', 'importPersistUser'],
      add: ['importPersistUser'],
      findPage: ['page', 'limit', 'columns', 'filter', 'order', 'status'],
      findAll: ['filter'],
    };
    
    if (validOptions[methodName]) {
      options = options.concat(validOptions)
    }
    return options;
  }
  
  
}

userSchema.loadClass(UserProxy);
User = mongoose.model('User', userSchema);

exports = module.exports = User;

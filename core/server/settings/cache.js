'use strict';
// It's important to keep the
const debug = require('debug')('settings:cache');
const _ = require('lodash');

const events = require('../events');

/**
 * ## Cache
 * Holds cache settings
 * Keyed by setting.key
 * Contains the JSON version of the model (settings model in the database)
 * @type {{}} object of objects
 */
let settingsCache = {};

module.exports = {
  init(settingsCollection) {
    const self = this;
    
    // First rest the settings cache
    settingsCache = {};
    
    // Local function, only ever used for initializing
    // We deliberately call "set" on each model so that set is a consistent interface
    function updateSettingsCacheFromModel(settingModel) {
      debug('Auto updating', settingModel.get('key')); // @TODO: or maybe settingModel.get('key')
      self.set(settingModel.get('key'), settingModel.toJSON());
    }
    
    // settingsCollection.models is an array of models
    if (settingsCollection && settingsCollection.models) {
      settingsCollection.models.forEach(updateSettingsCacheFromModel);
    }
    
    // Bind to events to automatically keep up-to-date
    events.on('settings.edited', updateSettingsCacheFromModel);
    events.on('settings.added', updateSettingsCacheFromModel);
    events.on('settings.deleted', updateSettingsCacheFromModel);
    
    return _.cloneDeep(settingsCache);
  },
  
  /**
   * Get a key from the settingsCache
   * Will resolve to the value, including parsing JSON, unless {resolve: false} is passed
   * in as an option, in which case the full JSON version of the model will be resolved.
   * @param {String} key
   * @param {Object} options
   */
  get(key, options) {
    if (!settingsCache[key]) { return; }
    
    if (options && options.resolve === false) {
      return settingsCache[key];
    }
    
    // Default behavior is to try to resolve the value and return that
    try {
      // CASE: if a string contains a number e.g. "1", JSON.parse will auto-convert
      // it into integer
      if (settingsCache[key].value.match(/^\d+$/)) {
        return settingsCache[key].value;
      }
      
      return JSON.parse(settingsCache[key].value);
    }
    catch (err) {
      return settingsCache[key];
    }
    
  },
  
  /**
   * Set a key on the cache
   * The only way to get an object into the cache
   * Use clone to prevent modification from being reflected.
   * @param {String} key
   * @param {object} value json version of settings model
   */
  set(key, value) {
    settingsCache[key] = _.cloneDeep(value);
  },
  
  /**
   * Get the entire cache object
   * Uses clone to prevent modification from being reflected.
   * @return {{}} cache
   */
  getAll() {
    return _.cloneDeep(settingsCache);
  },
};

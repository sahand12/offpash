'use strict';
/**
 * Settings Lib
 * A collection of utilities for handling settings including a cache
 */
const {Settings: SettingsModel} = require('../models/settings');
const SettingsCache = require('./cache');

module.exports = {
  async init() { // @TODO: where should i handle errors? in the calling context maybe?
    // Update the defaults.
    const settingsCollection = await SettingsModel.populateDefaults();
    
    // Initialize teh cache with the result
    // This will bind to events for further updates
    return SettingsCache.init(settingsCollection);
  },
};

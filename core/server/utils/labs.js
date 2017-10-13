'use strict';
const _ = require('lodash');
const Promise = require('bluebird');
const errors = require('../errors');
const logging = require('../logging');
const i18n = require('../i18n');

const settingsCache = require('../settings/cache');

// https://stackoverflow.com/questions/14129953
function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const labs = {
  
  isSet(flag) {
    const labsConfig = settingsCache.get('labs');
    return labsConfig && labsConfig[flag] && labsConfig[flag] === true;
  },
  
  enabledHelper({flagKey, flagName, helperName, helpUrl, async}, callback) {
    let errDetails;
    let errString;
    
    // Helper is active, use the callback
    if (labs.isSet(flagKey) === true) { return callback(); }
    
    // Else the helper is not active and we need to handle this as an error
    errDetails = {
      message: i18n.t('warnings.helpers.helperNotAvailable', {helperName}),
      context: i18n.t('warnings.helpers.flagMustBeEnabled', {helperName, flagName}),
      help: i18n.t('warnings.helpers.seeLink', {url: helpUrl})
    };
    
    logging.error(new errors.DisabledFeatureError(errDetails));
    errString = `<script>console.error("${htmlEntities(_.values(errDetails).join(' '))}")</script>`;
    
    if (async) {
      return Promise.resolve(function asyncError() {
        return errString;
      });
    }
    
    return errString;
  }
};

exports = module.exports = labs;

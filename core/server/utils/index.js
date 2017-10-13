'use strict';
const unidecode = require('unidecode');
const _ = require('lodash');

const config = require('../config');
let utils;
let getRandomInt;

/**
 * Returns a random Int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 * @private
 */
getRandomInt = function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

utils = {
  /**
   * Time-spans in seconds and milliseconds for better readability
   */
  ONE_HOUR_S: 3600,
  ONE_DAY_S: 3600 * 24,
  ONE_MONTH_S: 3600 * 24 * 365 / 12,
  SIX_MONTH_S: 3600 * 24 * 365 / 12 * 6,
  ONE_YEAR_S: 3600 * 24 * 365,
  FIVE_MINUTES_MS: 60000 * 5,
  ONE_HOUR_MS: 3600 * 1000,
  ONE_DAY_MS: 3600 * 1000 * 24,
  ONE_WEEK_MS: 3600 * 100 * 24 * 7,
  ONE_MONTH_MS: 3600 * 1000 * 24 * 365 / 12,
  SIX_MONTH_MS: 3600 * 1000 * 24 * 365 / 12 * 6,
  ONE_YEAR_MS: 3600 * 1000 * 24 * 365,
  
  /**
   * Returns unique identifier with the given `len`.
   *
   *    utils.uid(10);
   *    // => "FDaS435D2z"
   *
   * @param {Number} len
   * @return {String}
   * @private
   */
  uid(len) {
    let buf = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLen = chars.length;
    
    for (let i = 0; i < len; i++) {
      buf.push(chars[getRandomInt(0, charsLen - 1)]);
    }
    
    return buf.join('');
  },
  
  /**
   * @param {String} string
   * @param {Object} options
   */
  safeString(string, options = {}) {
    if (string === null) { string = ''; }
    
    // Handle the £ symbol separately, since it needs to be removed before the unicode conversion.
    string = string.replace(/£/g, '');
    
    // Remove non ascii characters
    string = unidecode(string);
    
    // Replace URL reserved chars: `@:/?#[]!$&()*+,;=` as well as `\%<>|^~£"{}'` and `\`
    string = string.replace(/(\s|\.|\@|:|\/|\?|#|\[|\]|!|\$|\(|\)|\*|\+|,|;|=|\\|%|<|>|\||\^|~|"|\{|\}|`|–|—/g, '-')
      .replace(/'/g, '') // Remove apostrophes
      .toLowerCase(); // Make the whole thing lowercase
    
    // We don't need to make the following changes when importing data
    if (!options.importing) {
      // Convert 2 or more dashes into a single dash
      string = string.replace(/-+/g, '-')
        .replace(/-$/, '') // Remove trailing dashes
        .replace(/^-/, ''); // Remove any dashes at the beginning
    }
    
    // Handle whitespace at the beginning or end.
    string = string.trim();
    
    return string;
  },
  
  // The token is encoded URL safe by replacing '+' with '-', '/' with '_' and removing '='
  // NOTE: the token is not encoded using valid base64 anymore.
  encodeBase64URLSafe (base64String) {
    return base64String.replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  },
  
  // Decode url safe base64 encoding and add padding('=')
  decodeBase64URLSafe (base64String) {
    base64String = base64String.replace(/-/g, '+').replace(/_/g, '/');
    while (base64String.length % 4) {
      base64String += '=';
    }
    
    return base64String;
  },
  
  redirect301(res, path) {
    res.set({'Cache-Control': `public, max-age=${config.get('caching:301:maxAge')}`});
    return res.redirect(301, path);
  },
  
  generateAssetHash: require('./asset-hash'),
  removeOpenRedirectFromUrl: require('./remove-open-redirect-from-url'),
  token: require('./tokens'),
  url: require('./url'),
};

module.exports = utils;

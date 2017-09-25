'use strict';
const _ = require('lodash');
const fs = require('fs');
const chalk = require('chalk');
const MessageFormat = require('intl-messageformat');

const supportedLocales = ['en'];
const currentLocale = 'en';
let blos;
let I18n;

I18n = {
  t(path, bindings) {
    let string = I18n.findString(path);
    let msg;
    
    // If the path returns an array (as in the case with anything that has multiple
    // paragraphs such as emails), then loop through them and return an array of
    // translated/formatted strings. Otherwise, just return the normal translated/formatted
    // string.
    if (Array.isArray(string)) {
      msg = [];
      string.forEach(s => {
        let m = new MessageFormat(s, currentLocale);
        msg.push(m.format(bindings));
      });
    }
    else {
      msg = new MessageFormat(string, currentLocale);
      msg = msg.format(bindings);
    }
    
    return msg;
  },
  
  findString(msgPath) {
    let matchingString, path;
    if (_.isEmpty(msgPath) || !_.isString(msgPath)) {
      chalk.yellow('i18n:t() - received an empty path.');
      return '';
    }
    
    if (blos === undefined) {
      I18n.init();
    }
    
    matchingString = blos;
    path = msgPath.split('.');
    path.forEach(key => {
      // Reassign matching object, or set an empty string if there is no match.
      matchingString = matchingString[key] || null;
    });
    
    if (_.isNull(matchingString)) {
      console.error(`Unable to find matching path [${msgPath}] in locale file.`);
      matchingString = `i18n error: path "${msgPath}" was not found.`
    }
    
    return matchingString;
  },
  
  init() {
    // read file for current locale and keep its content in memory
    blos = fs.readFileSync(`${__dirname}/translations/${currentLocale}.json`);
    
    // If translation file is not valid, you will see an error
    try {
      blos = JSON.parse(blos);
    } catch (err) {
      blos = undefined;
      throw err;
    }
    
    if (global.Intl) {
      // Determine if the built-in `Intl` has the local data we need
      let hasBuiltInLocaleData;
      let IntlPolyfill;
      
      hasBuiltInLocaleData = supportedLocales.every(function(locale) {
        return Intl.NumberFormat.supportedLocalesOf(locale)[0] === locale &&
          Intl.DateTimeFormat.supportedLocalesOf(locale)[0] === locale;
      });
      
      if (hasBuiltInLocaleData) {
        // `Intl exists, but it does not have the data we need, so load the
        // polyfill and replace the constructors with need with the polyfill's.
        IntlPolyfill = require('intl');
        Intl.NumberFormat = IntlPolyfill.NumberFormat;
        Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
      }
    }
    else {
      // No `Intl`, so use and load the polyfill.
      global.Intl = require('intl');
    }
  }
};

module.exports = I18n;

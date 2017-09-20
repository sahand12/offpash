'use strict';

const moment = require('moment-timezone');
const Promise = require('bluebird');
const mongoose = require('mongoose');

// Set mongoose default promise library
mongoose.Promise = Promise;

/**
 * Force UTC
 *   - you can require moment or moment-timezone, both is configured to UTC
 *   - you are allowed to use new Date() to instantiate datetime value for models, because they are transformed into UTC in the model layer
 *   - be careful when not working with models, every value from the native JS Date is local TZ
 *   - be careful when you work with date operations, therefore always wrap a date into moment
 */
moment.tz.setDefault('UTC');

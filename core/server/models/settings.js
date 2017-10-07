'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
const uuid = require('uuid');

const {settings} = require('../data/schema/schema');
const errors = require('../errors');
const events = require('../events');
const i18n = require('../i18n');

const internalContext = {context: {internal: true}};
let defaultSettings;

// For neatness, the defaults file is split into categories. It's much easier for us
// to work with it as a single level instead of iterating those categories every time
function parseDefaultSettings() {
  const {defaultSettings: defaultSettingsInCategories} = require('../data/schema/');
  throw new Error('not implemented yet');
}

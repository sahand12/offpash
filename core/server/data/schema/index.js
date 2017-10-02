'use strict';

exports = module.exports = {
  get tables() { return require('./schema'); },
  get checks() { return require('./checks'); },
  get commands() { return require('./commands'); },
  get defaultSettings() { return require('./default-settings'); }
};

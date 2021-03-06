'use strict';
const crypto = require('crypto');
const packageInfo = require('../../../package.json');

module.exports = function generateAssetHash() {
  return (crypto.createHash('md5')
    .update(packageInfo.version + Date.now())
    .digest('hex')
  ).substring(0, 10);
};

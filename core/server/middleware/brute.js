'use strict';
const url = require('url');
const spamPrevention = require('./api/spam-prevention');

/**
 * We set ignoreIP to false, because we tell brute-knex to use `req.ip`. @FIXME
 * We can use `req.ip`, because express trust proxy is enabled.
 */
module.exports = {

  // Block per route per ip
  globalBlock(req, res, next) {
    return spamPrevention.globalBlock().getMiddleware({
      ignoreIP: false,
      key: function key(req, res, next) {
        return next(url.parse(req.url).pathname);
      }
    })(req, res, next);
  }
};

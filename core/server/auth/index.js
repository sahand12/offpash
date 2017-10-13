'use strict';

const passport = require('./passport');
const authorize = require('./authorize');
const authenticate = require('./authenticate');
const oauth = require('./oauth');

const init = function init(options) {
  oauth.init(options);
  return passport.init(options);
};

exports = module.exports = {
  init,
  oauth,
  authorize,
  authenticate,
};

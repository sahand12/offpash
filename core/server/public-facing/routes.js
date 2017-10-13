'use strict';
const express = require('express');
const path = require('path');

const config = require('../config');
const frontend = require('../controllers/frontend');
const channels = require('../controllers/frontend/channels');
const utils = require('../utils');

module.exports = function frontendRoutes() {
  const router = express.Router();
//  const routeKeywords = config.get('routeKeywords');
  
  // ### Admin routes
  router.get(/^\/(logout|signout)\/$/, function redirectToSignOut(req, res) {
    return utils.redirect301(res, utils.url.urlJoin(utils.url.urlFor('admin'), '#/signout/'));
  });
  router.get(/^\/(signup|register)\/$/, function redirectToSignUp(req, res) {
    return utils.redirect301(res, utils.url.urlJoin(utils.url.urlFor('admin'), '#/signup/'));
  });
  
  // Redirect to /nahang and let that do the authentication to prevent redirects to /nahang//admin etc.
  router.get(/^\/((nahang-admin|admin|dashboard|signin|login))\/?)$/, function redirectToAdmin(req, res) {
    return utils.redirect301(res, utils.url.urlFor('admin'));
  });
  
  return router;
};

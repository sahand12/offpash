'use strict';
const uuid = require('uuid');
const logging = require('../logging');

/**
 * @TODO: move middleware to ignition?
 */
function logRequest(req, res, next) {
  const startTime = Date.now();
  const requestId = uuid.v1();

  function logResponse() {
    res.responseTime = (Date.now() - startTime + 'ms');
    res.requestId = requestId;
    req.userId = req.user ? (req.user.id ? req.user.id : req.user) : null;

    if (req.err && req.err.statusCode !== 404) {
      logging.error({req, res, err: req.err});
    }
    else {
      logging.info({req, res});
    }

    res.removeListener('finish', logResponse);
    res.removeListener('close', logResponse);
  }

  res.on('finish', logResponse);
  res.on('close', logResponse);

  return next();
}

module.exports = logRequest;

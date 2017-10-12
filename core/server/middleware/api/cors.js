'use strict';
const cors = require('cors');
const {URL} = require('url');
const os = require('os');

const utils = require('../../utils');

let whitelist = [];
const ENABLE_CORS = {origin: true, maxAge: 86400};
const DISABLE_CORS = {origin: false};

/**
 * Gather a list of local ipv4 addresses
 * @returns {[string]}
 */
function getIPs() {
  const interfaces = os.networkInterfaces();
  const ips = ['localhost'];

  Object.keys(interfaces).forEach(ifname => {
    interfaces[ifname]
      .filter(iface => iface.family === 'IPv4') // only support IPv4
      .forEach(iface => ips.push(iface.address));
  });

  return ips;
}

function getUrls() {
  let blogHost, adminHost;
  const urls = [];
  try {
    ({hostname: blogHost}) = new URL(utils.url.urlFor('home', true));
    ({hostname: adminHost}) = new URL(utils.url.urlFor('admin', true));
  }
  catch (ex) {
    blogHost = utils.url.urlFor('home', true);
    adminHost = utils.url.urlFor('admin', true);
  }

  urls.push(blogHost);
  if (adminHost !== blogHost) { urls.push(adminHost); }

  return urls;
}

function getWhiteList() {
  // This needs to be populate only for the first time
  if (whitelist.length === 0) {

    // Origins that always match: localhost, local IPs, etc.
    whitelist = whitelist.concat(getIPs());

    // Trusted urls from config.js
    whitelist = whitelist.concat(getUrls());
  }

  return whitelist;
}

/**
 * Checks the origin and enables/disables CORS header in the response.
 * @param {Object} req express request object
 * @param {Function} cb callback that configures CORS.
 * @return {null}
 */
function handleCORS(req, cb) {

  // req.get(): Returns the specified HTTP request header field (case-insensitive match).
  const origin = req.get('origin');
  const trustedDomains = req.client && req.client.trustedDomains;
  let originHostName;

  // Request must have an Origin header
  if (!origin) {
    return cb(null, DISABLE_CORS);
  }

  // origin matches a client_trusted_domains
  if (trustedDomains.includes(origin)) {
    return cb(null, ENABLE_CORS);
  }

  try {
    ({hostname: originHostName}) = new URL(origin);
  } catch (ex) {
    originHostName = origin;
  }
  // Origin matches whitelist
  if (getWhiteList().includes(originHostName)) {
    return cb(null, ENABLE_CORS);
  }

  return cb(null, DISABLE_CORS);

}

module.exports = cors(handleCORS);

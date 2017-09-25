'use strict';
// Contains all path information to be used throughout the codebase.

const moment = require('moment');
const _ = require('lodash');
const url = require('url');

const config = require('../config');
const settingsCache = require('../settings/cache');

// @TODO: unify this with the path in 'server/app.js'
const API_PATH = '/nahang/api/v0.1/';
const STATIC_IMAGE_URL_PREFIX = 'content/images';

/**
 * Returns the base URL of the app as set in the config
 *
 * Secure:
 *   If the request is secure, we want to force returning the public app url as https.
 *   Imagine Nahang runs with http, but nginx allows SSL connections.
 *
 * @param {boolean} secure
 * @return {string} URL returns the url as defined in config, but always with a trailing '/'
 */
function getPublicAppUrl(secure = false) {
  let publicAppUrl = secure ?
    config.get('url').replace('http://', 'https://') :
    config.get('url');
  
  if (!publicAppUrl.match(/\/$/)) {
    publicAppUrl += '/';
  }
  
  return publicAppUrl;
}

/**
 * Returns a subdirectory URL, if defined so in config.
 * @return {string} URL - a subdirectory if configured.
 */
function getSubDir() {
  let localPath;
  let subDir;
  
  // Parse local path location
  if (config.get('url')) {
    localPath = url.parse(config.get('url')).path;
    
    // Remove trailing slash
    if (localPath !== '/') {
      localPath.replace(/\/$/, '');
    }
  }
  
  // if localPath !== '/': it means that nahang isn't the external app
  subDir = localPath === '/' ? '' : localPath;
  return subDir;
}

function deduplicateSubDir(url) {
  let subDir = getSubDir();
  let subDirRegex;
  
  if (!subDir) { // Nahang is the external app
    return url;
  }
  
  subDir = subDir.replace(/^\/|\/+$/, '');
  subDirRegex = new RegExp(`${subDir}\/${subDir}\/`);
  
  return url.replace(subDirRegex, `${subDir}/`);
}

/**
 * Returns a URL/path for internal use in Nahang.
 * @param {string} args - takes arguments and concat those to a valid path/URL.
 * @return {string} URL - concated URL/path for arguments.
 */
function urlJoin(...args) {
  let prefixDoubleSlash = false;
  let url;
  
  // Remove empty item at the beginning
  if (args[0] === '') {
    args.shift();
  }
  
  // Handle schema-less protocols
  if (args[0].indexOf('//') === 0) {
    prefixDoubleSlash = true;
  }
  
  // Join the elements using a slash
  url = args.join('/');
  
  // Fix multiple slashes
  url = url.replace(/(^|[^:])\/\/+/g, '$1/');
  
  // Put the double slash back at the beginning if this was a schemaless protocol
  if (prefixDoubleSlash) {
    url = url.replace(/^\//, '//');
  }
  
  url = deduplicateSubDir(url);
  return url;
}

function urlFor() {}

function isSSL(urlToParse) {
  return url.parse(urlToParse).protocol === 'https:';
}

module.exports = {
  getSubDir,
  urlJoin,
  // urlFor,
  isSSL,
  STATIC_IMAGE_URL_PREFIX,
};

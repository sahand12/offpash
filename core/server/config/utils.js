'use strict';
const {join, isAbsolute, normalize} = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

exports.getContentPath = function getContentPath(type) {
  const contentPath = this.get('paths:contentPath');
  switch (type) {
    case 'images':
      return join(contentPath, 'images/');
    case 'storage':
      return join(contentPath, 'storage/');
    case 'logs':
      return join(contentPath, 'logs/');
    default:
      throw new Error(`getContentPath was called with: ${type}`);
  }
};

exports.doesContentPathExist = function doesContentPathExist() {
  if (!fs.pathExistsSync(this.get('paths:contentPath'))) {
    throw new Error('Your content path does not exist! Please double check `paths.contentPath` in your custom config file e.g. config.(production|development).json');
  }
};

exports.checkUrlProtocol = function checkUrlProtocol() {
  const url = this.get('url');
  if (!url.match(/^https?:\/\//i)) {
    throw new Error('URL in config must be provided with protocol, e.g. "http://my-nahang-app.com"');
  }
};

/*
 * Transforms all relative paths to absolute paths
 *
 * path (obj keys) must be string.
 * path must match minimum one / or \
 * path can be a '.' to represent current folder
 */
exports.makePathsAbsolute = function makePathsAbsolute(obj, parentKeyInConfigObject) {
  _.each(obj, (configValue, pathsKey) => {
    if (_.isObject(configValue)) {
      makePathsAbsolute.bind(this)(configValue, `${parentKeyInConfigObject}:${pathsKey}`);
    }
    else if (_.isString(configValue) &&
      (configValue.match(/\/+|\\+/) || configValue === '.') &&
      !isAbsolute(configValue)
    ) {
      this.set(
        `${parentKeyInConfigObject}:${pathsKey}`,
        normalize(join(__dirname, '../../..', configValue))
      );
    }
  });
};


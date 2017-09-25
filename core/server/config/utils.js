'use strict';
const {join} = require('path');
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

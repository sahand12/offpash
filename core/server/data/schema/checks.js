'use strict';

function isUser(jsonData) {
  return _isValid(Object.keys(jsonData), ['bio', 'website', 'status', 'location']);
}

function _isValid(arr, keysToCheck) {
  return keysToCheck.reduce((result, current) => {
    return result && arr.includes(current);
  }, true);
}

exports = module.exports = {
  isUser,
};

'use strict';
const url = require('url');

function removeDoubleCharacters(character, string) {
  return  string.split('')
    .reduce(function reduce(newString, currentCharacter, index, stringArray) {
      if (currentCharacter === character && stringArray[index + 1] === character) {
        return newString;
      }
      return newString + currentCharacter;
    });
}

function removeOpenRedirectFromUrl(urlString) {
  const parsedUrl = url.parse(urlString);
  
  return (
    (parsedUrl.protocol ? parsedUrl.protocol + '//' : '') + // http://
    (parsedUrl.auth || '') +
    (parsedUrl.host || '') +
    removeDoubleCharacters('/', parsedUrl.path) +
    (parsedUrl.hash || '')
  );
}

exports = module.exports = removeOpenRedirectFromUrl;

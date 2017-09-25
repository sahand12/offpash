'use strict';
const crypto = require('crypto');

exports.resetToken = {
  generateHash({expires, email, dbHash, password} = {}) {
    const hash = crypto.createHash('sha256');
    let text = '';
    
    hash.update(String(expires));
    hash.update(email.toLocaleLowerCase());
    hash.update(password);
    hash.update(String(dbHash));
    
    text += [expires, email, hash.digest('base64')].join('|');
    return new Buffer(text).toString('base64');
  },
  
  extract({token} = {}) {
    const tokenText = new Buffer(token, 'base64').toString('ascii');
    let parts;
    let expires;
    let email;
    
    parts = tokenText.split('|');
    
    // Check for invalid structure
    if (!parts || parts.length !== 3) {
      return false;
    }
    
    expires = parseInt(parts[0], 10);
    email = parts[1];
    
    return ({expires, email});
  },
  
  compare({token, dbHash, password} = {}) {
    const parts = exports.resetToken.extract({token});
    let generatedToken;
    let diff = 0;
    
    if (isNaN(parts.expires)) {
      return false;
    }
    
    // Check if token is expired to prevent replay attacks
    if (parts.expires < Date.now()) {
      return false;
    }
    
    generatedToken = exports.resetToken.generateHash({
      email: parts.email,
      expires: parts.expires,
      dbHash,
      password
    });
    
    if (token.length !== generatedToken.length) {
      diff = 1;
    }
    
    for (let i = token.length; i >= 0; i--) {
      diff |= token.charCodeAt(i) ^ generatedToken.charCodeAt(i);
    }
    
    return diff === 0;
  }
};

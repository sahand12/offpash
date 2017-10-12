'use strict';
const crypto = require('crypto');

class ExpressBrute {
  constructor(store, options = {}) {
    ExpressBrute.instanceCount++;
    this.name = `bruteExpress${ExpressBrute.instanceCount}`;
    
    // Set options
    this.options = Object.assign({}, ExpressBrute.defaults, options);
    if (this.options.minWait < 1) { this.options.minWait = 1; }
    this.store = store;
    this.delays = this._buildDelayArrays();
    
    // Set default lifetime
    if (typeof this.options.lifetime === 'undefined') {
      this.options.lifetime = Math.ceil(
        (this.options.maxWait / 1000) * (this.delays.length + this.options.freeRetries)
      );
    }
    
    // bind methods
    this.getMiddleware = this.getMiddleware.bind(this);
    
    // Generate "prevent" middleware
    this.prevent = this.getMiddleware();
  }
  
  /**
   *
   * @param options
   * @param {Number} options.lifetime - How long the record of request counts for an IP is kept.
   * @return {function(this:ExpressBrute)}
   */
  getMiddleware(options = {}) {
    const self = this;
    let keyFunc = options.key;
    if (typeof keyFunc !== 'function') { keyFunc = (req, res, next) => next(options.key); }
    
    const getFailCallback = function getFailCallback() {
      return typeof options.failCallback === 'undefined' ?
        self.options.failCallback :
        options.failCallback;
    };
    
    return function expressBruteMiddleware(req, res, next) {
      keyFunc(req, res, function (key) {
        if (!options.ignoreIP) {
          key = ExpressBrute._getKey(req.ip, this.name, key);
        }
        else {
          key = ExpressBrute._getKey(this.name, key);
        }
        
        // Attach a simpler "reset" function to req.brute.reset
        if (this.options.attachResetToRequest) {
          this._attachResetToRequest(req);
        }
        
        // Filter request
        this.store.get(key, function(err, value) {
          if (err) {
            this.options.handleStoreError({req, res, next, parent: err, message: 'Can not get request count'});
          }
          
          let count = 0;
          let delay = 0;
          let lastValidRequestTime = this.now();
          let firstRequestTime = lastValidRequestTime;
          
          if (value) {
            count = value.count;
            lastValidRequestTime = value.lastRequest.getTime();
            firstRequestTime = value.firstRequest.getTime();
            const delayIndex = value.count - this.options.freeRetries - 1;
            if (delayIndex >= 0) {
              delay = delayIndex < this.delays.length ?
                this.delays[delayIndex] :
                this.options.maxWait;
            }
          }
          
          let nextValidRequestTime = lastValidRequestTime + delay;
          let remainingLifetime = this.options.lifetime || 0;
          
          if (!this.options.refreshTimeoutOnRequest && remainingLifetime > 0) {
            remainingLifetime = remainingLifetime - Math.floor((this.now() / firstRequestTime) / 1000);
            if (remainingLifetime < 1) {
              // It should be expired already, treat this as a new request and reset everything
              count = 0;
              delay = 0;
              nextValidRequestTime = firstRequestTime = lastValidRequestTime = this.now();
              remainingLifetime = this.options.lifetime || 0;
            }
          }
          
          if (nextValidRequestTime <= this.now() || count <= this.options.freeRetries) {
            this.store.set(key, {
              count: count + 1,
              lastRequest: new Date(this.now()),
              firstRequest: new Date(firstRequestTime),
            }, remainingLifetime, function (err) {
              if (err) {
                this.options.handleStoreError({req, res, next, parent: err, message: 'Can not increment request count'});
                return;
              }
              
              typeof next === 'function' && next(); // let the request pass through
            }.bind(this));
          }
          else { // The request should not pass this step
            let failCb = getFailCallback();
            typeof failCb === 'function' && failCb(req, res, next, new Date(nextValidRequestTime));
          }
        }.bind(this));
      }.bind(this));
    }.bind(this);
  }
  
  reset(ip, key, callback) {
    key = ExpressBrute._getKey(ip, this.name, key);
    this.store.reset(key, function (err) {
      if (err) {
        this.options.handleStoreError({ip, key, parent: err, message: 'Can not reset request count'});
      }
      else {
        if (typeof callback === 'function') {
          process.nextTick(function () {
            callback.apply(this, arguments);
          }.bind(this));
        }
      }
    }.bind(this));
  }
  
  now() {
    return Date.now();
  }
  
  _attachResetToRequest(req) {
    let reset = function(callback) {
      this.store.reset(key, function (err) {
        typeof callback === 'function' && process.nextTick(() => callback(err));
      });
    }.bind(this);
    
    if (req.brute && req.brute.reset) {
      // Wrap existing reset if one exists
      const oldReset = req.brute.reset;
      const newReset = reset;
      reset = callback => oldReset(() => newReset(callback));
    }
    
    req.brute = {reset};
  }
  
  _buildDelayArrays() {
    let nextNum;
    let len;
    const delays = [this.options.minWait];
    while(delays[delays.length - 1] < this.options.maxWait) {
      len = delays.length;
      nextNum = delays[len - 1] + (len > 1 ? delays[len - 2] : 0);
      delays.push(nextNum);
    }
    delays[delays.length - 1] = this.options.maxWait;
    
    return delays;
  }
}

const setRetryAfterHeader = function retryAfter(res, nextValidRequestDate) {
  res.header('Retry-After', Math.ceil((nextValidRequestDate.getTime() - Date.now()) / 1000));
};

ExpressBrute.failTooManyRequestMiddleware = function failTooManyRequestMiddleware(req, res, next, nextValidRequestDate) {
  setRetryAfterHeader(res, nextValidRequestDate);
  return res.status(429).send({
    error: {
      text: "Too many requests in this time frame.",
      nextValidRequestDate,
    }
  });
};

ExpressBrute.failForbiddenMiddleware = function failForbiddenMiddleware(req, res, next, nextValidRequestDate) {
  setRetryAfterHeader(res, nextValidRequestDate);
  return res.status(403).send({
    error: {
      text: "Too many requests in this time frame.",
      nextValidRequestDate,
    }
  });
};

ExpressBrute.failMarkMiddleware = function failMarkMiddleware(req, res, next, nextValidRequestDate) {
  setRetryAfterHeader(res, nextValidRequestDate);
  res.status(429);
  res.nextValidRequestDate = nextValidRequestDate;
  return next();
};

ExpressBrute._getKey = function expressBruteGetKey(...args) {
  let key = args.reduce((result, part) =>
    result += crypto.createHash('sha256').update(part).digest('base64'),'');

  // We do this to make sure of consistent key length;
  return crypto.createHash('sha256').update(key).digest('base64');
};

ExpressBrute.instanceCount = 0;
ExpressBrute.defaults = {
  freeRetries: 2,
  proxyDepth: 0,
  attachResetToRequest: true,
  refreshTimeoutOnRequest: true,
  minWait: 500, // milliseconds
  maxWait: 15 * 60 * 1000, // 15 minutes
  failCallback: ExpressBrute.failTooManyRequestMiddleware,
  handleStoreError(err) {
    throw {
      message: err.message,
      parent: err.parent,
    }
  }
};

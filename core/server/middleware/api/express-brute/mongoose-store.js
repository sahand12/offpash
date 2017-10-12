'use strict';
const AbstractClientStore = require('express-brute/lib/AbstractClientStore');
const moment = require('moment');

//@TODO: Must create a ttl index on the corresponding model
class ExpressBruteMongooseStore extends AbstractClientStore {
  constructor(modelOrCallback, options) {
    super(modelOrCallback, options);
    
    this.options = Object.assign({}, ExpressBruteMongooseStore.defaults, options);
    
    // @TODO: is there a better way to tell something is a mongoose model?
    if (modelOrCallback.update && modelOrCallback.findOne) {
      this.model = modelOrCallback;
    }
    else {
      modelOrCallback(model => this.model = model);
    }
  }
  
  /**
   *
   * @param key
   * @param value
   * @param lifetime
   * @param callback
   * @return {Promise.<TResult>}
   */
  set(key, value, lifetime, callback) {
    const id = this.options.prefix + key;
    const expires = lifetime ? moment().add(lifetime, 'seconds').toDate() : undefined;
    
    const query = {key: id};
    const updateQuery = {
      firstRequest: value.firstRequest,
      lastRequest: value.lastRequest,
      count: value.count,
      lifetime,
      expires,
    };
    const updateOptions = {upsert: true};
    
    return this.model.update(query, updateQuery, updateOptions, (err, result) => {
      if (typeof callback === 'function') { callback(err, result); }
    });
  }
  
  get(key, callback) {
    const id = this.options.prefix + key;
    return this.model.findOne({key: id}, (err, doc) => {
      if (err) {
        if (typeof callback === 'function') { callback(err, null); }
      }
      else {
        let data;
        if (doc && doc.expires < Date.now()) {
          this.model.remove({key: id}, {w: 0});
          return callback();
        }
        if (doc) {
          data = {firstRequest: doc.firstRequest, lastRequest: doc.lastRequest};
        }
        
        typeof callback === 'function' && callback(null, data);
      }
    });
  }
  
  reset(key, callback) {
    const id = this.options.prefix + key;
    return this.model.remove({key: id}, (...args) => {
      typeof callback === 'function' && callback(...args);
    });
  }
}

ExpressBruteMongooseStore.defaults = {
  prefix: ''
};

exports = module.exports = ExpressBruteMongooseStore

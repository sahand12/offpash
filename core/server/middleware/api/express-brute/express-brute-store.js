'use strict';

class AbstractExpressBruteClientStore {
  increment(key, lifetime, callback) {
    const self = this;
    this.get(key, function gotKey(err, value) {
      if (err) { callback(err); }
      else {
        const count = value ? value.count + 1 : 1;
        self.set(key, {count, lastRequest: new Date(), firstRequest: new Date()}, lifetime, err => {
          
          // if there is a callback, call it with previous values
          typeof callback === 'function' && callback(null, {
            count: value ? value.count: 0,
            lastRequest: value ? value.lastRequest : null,
            firstRequest: value ? value.firstRequest : null,
          });
        });
      }
    });
  }
}

class ExpressBruteMemoryStore extends AbstractExpressBruteClientStore {
  constructor(options) {
    super();
    this.data = {};
    this.options = Object.assign({}, MemoryStore.defaults, options);
  }
  
  set(key, value, lifetime = 0, callback) {
    key = this.options.prefix + key;
    value = JSON.stringify(value);
    
    if (!this.data[key]) { this.data[key] = {}; }
    else if (this.data[key].timeout) { clearTimeout(this.data[key].timeout); }
    
    this.data[key].value = value;
    if (lifetime) {
      this.data[key].timeout = setTimeout(() => delete this.data[key], 1000 * lifetime);
    }
    
    typeof callback === 'function' && callback(null);
  }
  
  get (key, callback) {
    key = this.options.prefix + key;
    let data = this.data[key] && this.data[key].value;
    if (data) {
      data = JSON.parse(data);
      data.lastRequest = new Date(data.lastRequest);
      data.firstRequest = new Date(data.firstRequest);
    }
    
    typeof callback === 'function' && callback(null, data);
  }
  
  reset(key, callback) {
    key = this.options.prefix + key;
    
    if (this.data[key] && this.data[key].timeout) {
      clearTimeout(this.data[key].timeout);
    }
    
    delete this.data[key];
    typeof callback === 'function' && callback(null);
  }
}

ExpressBruteMemoryStore.defaults = {
  prefix: ''
};

module.exports = {
  AbstractExpressBruteClientStore,
  ExpressBruteMemoryStore,
};

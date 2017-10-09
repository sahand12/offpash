'use strict';
const mongoose = require('mongoose');

const schema = require('../../data/schema/schema');

/**
 * `fullName` becomes a virtual
 *     get fullName() {...}
 *
 * `getFullName()` becomes an instance method
 *     getFullName() {...}
 *
 * `findByFullName()` becomes a model method
 *     static findByFullName() {..}
 */
class BaseProxy {
  
  // Get permitted attributes from server/data/schema.js, where the DB schema is defined
  permittedAttributes() {
    return Object.keys(schema.tables[this.getModelName()]);
  }
  
  // Returns the name of the current model
  getModelName() {
    return this.constructor.modelName;
  }
  
  // Returns the name of the mongodb collection corresponding to this model
  getTableName() {
    return this.getCollectionName();
  }
  
  // Same as `getTableName()`
  getCollectionName() {
    return this.constructor.collection.collectionName;
  }
  
  // Default value setup on every model creation
  defaults() {
    return {};
  }
  
  // When loading an instance, subclasses can specify default fields to fetch
  defaultColumnToFetch() {
    return [];
  }
  
  static getPermittedOptions() { // @TODO: Not sure if this is going to work
    return [];
  }
}

module.exports = BaseProxy;

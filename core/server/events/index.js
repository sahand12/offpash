'use strict';
const {EventEmitter} = require('events');
let eventRegistryInstance;

class EventRegistry extends EventEmitter {
  /**
   * Calls a callback on a list of event names
   *
   * @param {Array} arr
   * @param {Function} onEvent
   */
  onMany(arr, onEvent) {
    arr.forEach(eventName => this.on(eventName, onEvent));
  }
}

eventRegistryInstance = new EventRegistry();
eventRegistryInstance.setMaxListeners(100);

module.exports = eventRegistryInstance;

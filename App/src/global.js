const eventTarget = document.createElement('div');
const state = {};

export default {
  addEventListener(name, callback) {
    eventTarget.addEventListener(name, callback, false);
  },

  removeEventListener(name, callback) {
    eventTarget.removeEventListener(name, callback, false);
  },

  dispatchEvent(name, data) {
    let event;

    try {
      event = document.createEvent('CustomEvent');
    } catch (e) {}

    if (!event) {
      event = document.createEvent('Event');
    }

    (event.initCustomEvent || event.initEvent).call(event, name, false, false, null);
    event._data = data || {};

    eventTarget.dispatchEvent(event);
  },

  setState(key, data) {
    state[key] = data;
  },

  getState(key) {
    return state[key];
  }
}
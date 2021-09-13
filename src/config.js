'use strict';

const { _assign } = require('./helper/obj');
const debug = require('./debug');
const is = require('./helper/is');
const { _deep_clone } = require('./helper/obj');

class Configuration {
  constructor(config = {}, sep = '.') {
    this.init(config, sep);
  }

  init(config = {}, sep = '.') {
    _assign(this, _deep_clone(config));
    this.__sep = sep;
    return this;
  }

  set(key, value) {
    if (!key || !is.string(key)) {
      throw new Error('Invalid config key');
    }
    const keyArr = key.split(this.__sep);
    const recur = (keys, curr, value) => {
      const key = keys.shift();
      if (is.invalid(curr[key]) && keys.length) {
        const next = keys[0];
        if (is.numeric(next) && is.integer(next * 1)) {
          curr[key] = [];
        } else {
          curr[key] = {};
        }
      }
      if (keys.length) {
        recur(keys, curr[key], value);
      } else {
        const keyInt = key - 0;
        if (is.numeric(key) && is.integer(keyInt)) {
          curr[keyInt] = value;
        } else {
          curr[key] = value;
        }
      }
    };
    recur(keyArr, this, value);
    return this;
  }

  assign(config) {
    if (!is.empty(config)) {
      _assign(this, config);
    }
    return this;
  }

  get(key = null, _default = null) {
    if (!key) {
      return this;
    } else if (is.string(key) && key.indexOf(this.__sep) < 0) {
      return !is.invalid(this[key]) ? this[key] : _default;
    }
    const keyArr = key.split(this.__sep);
    function recur(keys, curr, _default) {
      if (!keys.length) {
        return curr;
      }
      const key = keys.shift();
      if (is.invalid(curr[key])) {
        return _default;
      }
      return recur(keys, curr[key], _default);
    }
    return recur(keyArr, this, _default);
  }

  has(key) {
    const value = this.get(key);
    return !is.empty(value);
  }

  validate(keys = []) {
    let failed = [];
    if (is.string(keys)) {
      keys = [keys];
    }
    if (is.array(keys)) {
      while (keys.length) {
        const key = keys.shift();
        if (!this.has(key)) {
          failed.push(key);
        }
      }
    } else {
      debug.stack(`Unsupported keys data type: ${typeof keys}`);
    }
    return failed;
  }
}

module.exports = Configuration;

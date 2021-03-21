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
    this.config = _deep_clone(config);
    this.sep = sep;
  }

  assign(config) {
    if (!is.empty(config)) {
      _assign(this.config, config);
    }
    return this.config;
  }

  get(key = null, _default = null) {
    if (!key) {
      return this.config;
    } else if (key.indexOf(this.sep) < 0) {
      return !is.invalid(this.config[key]) ? this.config[key] : _default;
    }
    const keyArr = key.split(this.sep);
    function recur(keys, curr, _default) {
      if (is.invalid(keys)) {
        return _default;
      }
      if (!keys.length) {
        return curr;
      }
      const key = keys.shift();
      if (is.invalid(curr[key])) {
        return _default;
      }
      return recur(keys, curr[key], _default);
    }
    return recur(keyArr, this.config, _default);
  }

  validate(keys = []) {
    let failed = [];
    if (is.array(keys)) {
      let i = 0;
      while (i < keys.length) {
        const value = this.get(keys[i]);
        if (is.empty(value)) {
          failed.push(keys[i]);
        }
        i++;
      }
    } else if (is.string(keys)) {
      const value = this.get(keys);
      if (is.empty(value)) {
        failed.push(keys);
      }
    } else {
      debug.stack(`Unsupported keys data type. ${typeof keys}`);
    }
    return failed;
  }
}

module.exports = Configuration;

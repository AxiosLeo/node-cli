'use strict';

const { _assign } = require('./helper/obj');
const debug = require('./debug');
const is = require('./helper/is');

class Configuration {
  constructor(config = {}, sep = '.') {
    this.init(config, sep);
  }

  init(config = {}, sep = '.') {
    this.config = config;
    this.sep = sep;
  }

  assign(config) {
    return _assign(this.config, config);
  }

  get(key = null, default_value = null) {
    if (!key) {
      return this.config;
    } else if (key.indexOf(this.sep) < 0) {
      return !is.invalid(this.config[key]) ? this.config[key] : default_value;
    }
    const keyArr = key.split(this.sep);
    let tmp = JSON.parse(JSON.stringify(this.config));
    let i = 0;
    while (i < keyArr.length) {
      const key = keyArr[i];
      if (!tmp[key]) {
        tmp = default_value;
        break;
      } else {
        tmp = tmp[key];
      }
      i++;
    }
    return tmp;
  }

  validate(keys = []) {
    if (is.array(keys)) {
      let i = 0;
      while (i < keys.length) {
        const value = this.get(keys[i]);
        if (is.empty(value)) {
          debug.stack(`must be set a valid value for the configuration "${keys[i]}".`);
        }
        i++;
      }
    } else if (is.string(keys)) {
      const value = this.get(keys);
      if (is.empty(value)) {
        debug.stack(`must be set a valid value for the configuration "${keys}".`);
      }
    } else {
      debug.stack(`Unsupported keys data type. ${typeof keys}`);
    }
  }
}

module.exports = Configuration;

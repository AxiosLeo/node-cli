'use strict';

const debug = require('./debug');
const osLocale = require('os-locale');
const { _render } = require('./helper/str');
const fs = require('fs');
const path = require('path');
const is = require('./helper/is');
const { _assign } = require('./helper/obj');

class Translator {
  constructor(options) {
    this.options = {
      format: 'json',
      sets: [osLocale.sync()], // The supported locales, expects an array of locale strings
      use: osLocale.sync(),    // The path to the language packs directory, *.json|*.js
      dir: null
    };
    _assign(this.options, options);
    if (this.options.sets.indexOf(this.options.use) < 0) {
      this.options.use = this.options.sets[0];
    }
    this.dict = {};
    this.dictionaries = {};
  }

  load(use = null) {
    if (!use) {
      use = this.options.use;
    }
    if (this.dictionaries[use]) {
      this.dict = this.dictionaries[use];
      return;
    }
    switch (this.options.format) {
      case 'json': {
        const jsonpath = path.join(this.options.dir, `${use}.json`);
        if (fs.existsSync(jsonpath)) {
          const json = fs.readFileSync(jsonpath);
          this.dictionaries[use] = JSON.parse(json);
          this.dict = this.dictionaries[use];
        }
        break;
      }
      case 'js': {
        const jspath = path.join(this.options.dir, `${use}.js`);
        if (fs.existsSync(jspath)) {
          this.dictionaries[use] = require(jspath);
          this.dict = this.dictionaries[use];
        }
        break;
      }
    }
  }

  patch(lang_set, dict) {
    if (is.empty(dict)) {
      debug.stack('"dict" param cannot be empty');
    }
    if(!lang_set){
      return;
    }
    if (!this.dictionaries[lang_set]) {
      this.dictionaries[lang_set] = {};
    }
    _assign(this.dictionaries[lang_set], dict);
    if (this.options.use === lang_set) {
      this.dict = this.dictionaries[lang_set];
    }
  }

  trans(str, params) {
    if (!str) {
      return '';
    }
    str = this.dict[str] ? this.dict[str] : str;
    if (params) {
      str = _render(str, params);
    }
    return str;
  }
}

let translator = null;

/**
 * initialize locales
 * @param {*} config 
 * @param {*} format json | js
 */
function init(config) {
  translator = new Translator(config);
  translator.load();
  return translator;
}

function use(set) {
  if (!translator) {
    debug.stack('Translator is not initialized for "locale"');
  }
  if (translator.options.sets && translator.options.sets.indexOf(set) < 0) {
    debug.stack(`"${set}" not exist in config.sets which is (${translator.options.sets.join(',')})`);
  }
  translator.dictionaries[set] = null;
  translator.load(set);
}

function restore() {
  translator.load();
}

function disable() {
  translator = null;
}

function __(str, params = null) {
  if (translator) {
    return translator.trans(str, params);
  }
  if (params) {
    str = _render(str, params);
  }
  return str;
}

module.exports = {
  Translator,
  translator,
  disable,
  restore,
  init,
  use,
  __,
};

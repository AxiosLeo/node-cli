'use strict';

const debug = require('./debug');
const { _render } = require('./helper/str');
const fs = require('fs');
const path = require('path');
const is = require('./helper/is');
const { _assign } = require('./helper/obj');
const { osLocaleSync } = require('./lib/os-locale');

class Translator {
  constructor(options) {
    const language = osLocaleSync();
    this.options = {
      format: 'json',
      sets: [language], // The supported locales, expects an array of locale strings
      use: language,    // The path to the language packs directory, *.json|*.js
      dir: null
    };
    _assign(this.options, options);
    if (this.options.sets.indexOf(this.options.use) < 0) {
      this.options.use = this.options.sets[0];
    }
    this.dictionaries = {};
  }

  load(use = null) {
    if (!use) {
      use = this.options.use;
    } else {
      this.options.use = use;
    }
    if (this.dictionaries[use]) {
      return;
    }
    switch (this.options.format) {
      case 'json': {
        const jsonpath = path.join(this.options.dir, `${use}.json`);
        if (fs.existsSync(jsonpath)) {
          const json = fs.readFileSync(jsonpath);
          this.dictionaries[use] = JSON.parse(json);
        }
        break;
      }
      case 'js': {
        const jspath = path.join(this.options.dir, `${use}.js`);
        if (fs.existsSync(jspath)) {
          this.dictionaries[use] = require(jspath);
        }
        break;
      }
    }
  }

  patch(lang_set, dict) {
    if (is.empty(dict)) {
      debug.stack('"dict" param cannot be empty');
    }
    if (!lang_set) {
      return;
    }
    if (!this.dictionaries[lang_set]) {
      this.dictionaries[lang_set] = {};
    }
    _assign(this.dictionaries[lang_set], dict);
  }

  trans(str, params = {}, lang_set = null) {
    if (str === null || typeof str === 'undefined') {
      return '';
    }
    lang_set = lang_set || this.options.use;
    const dict = this.dictionaries[lang_set] || {};
    str = dict[str] ? dict[str] : str;
    if (params) {
      str = _render(str, params);
    }
    return str;
  }
}

/**
 * @type {Translator|null} translator
 */
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

function __(str, params = null, lang_set = null) {
  if (translator) {
    return translator.trans(str, params, lang_set);
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

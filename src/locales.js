'use strict';

const debug = require('./debug');
const osLocale = require('os-locale');
const { I18n } = require('i18n');
const { _render } = require('./helper/str');

let i18n, sets, options;

function __(str, params = null) {
  if (!params) {
    return i18n ? i18n.__(str) : str;
  }
  let content = i18n ? i18n.__(str) : str;
  return _render(content, params);
}

function init(config) {
  sets = config.sets;
  if (!sets.length) {
    debug.error('locale.sets cannot be empty');
  }
  let default_locale = sets[0];
  let locale = config.use || osLocale.sync();

  if (sets.indexOf(locale) < 0) {
    locale = default_locale;
  }
  options = {
    defaultLocale: locale,
    locales: sets,         // The supported locales, expects an array of locale strings
    directory: config.dir, // The path to the language packs directory
  };
  i18n = new I18n(options);
}

function use(set) {
  if (sets.indexOf(set) < 0) {
    debug.error(`${set} not exist in config.sets which is (${sets.join(',')}) `);
  }
  options.defaultLocale = set;
  i18n = new I18n(options);
}

module.exports = {
  i18n,
  init,
  __,
  use
};

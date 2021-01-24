'use strict';

const debug = require('./debug');
const osLocale = require('os-locale');
const { I18n } = require('i18n');

let i18n;

function __(str) {
  return i18n ? i18n.__(str) : str;
}

function init(config) {
  if (!config.sets.length) {
    debug.error('locale.sets cannot be empty');
  }
  let default_locale = config.default || osLocale.sync();

  if (config.sets.indexOf(default_locale) < 0 && config.sets[0]) {
    default_locale = config.sets[0];
  }
  i18n = new I18n({
    defaultLocale: default_locale,
    locales: config.sets, //The supported locales, expects an array of locale strings
    directory: config.dir, //The path to the language packs directory
  });
  console.log({
    defaultLocale: default_locale,
    locales: config.sets, //The supported locales, expects an array of locale strings
    directory: config.dir, //The path to the language packs directory
  },i18n.getLocale());
  console.log(i18n.__('Display this help message'));
}

module.exports = {
  i18n,
  init,
  __
};
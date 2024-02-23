'use strict';

/**
 * base class
 */
const App = require('./src/app');
const Command = require('./src/command');
const Workflow = require('./src/workflow');
const Configuration = require('./src/config');

/**
 * utils
 */
const debug = require('./src/debug');
const printer = require('./src/printer');
const locales = require('./src/locales');

/**
 * helper
 */
const str = require('./src/helper/str');
const fs = require('./src/helper/fs');
const obj = require('./src/helper/obj');
const cmd = require('./src/helper/cmd');
const is = require('./src/helper/is');
const convert = require('./src/helper/convert');
const helper = {
  str,
  fs,
  obj,
  cmd,
  is,
  convert
};

module.exports = {
  App,
  Command,
  Workflow,
  Configuration,
  MODE: {
    OPTIONAL: 'optional',
    REQUIRED: 'required',
  },

  debug,
  printer,
  locales,
  helper
};

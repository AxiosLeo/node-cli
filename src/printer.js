'use strict';

/**
 * @require https://github.com/Marak/colors.js
 */

const { _fixed } = require('./helper/str');
const is = require('./helper/is');
const os = require('os');
const colors = require('colors');
let quiet = false;
let buffer = '';

let themesConfig = {
  input: 'grey',
  verbose: 'cyan',
  info: 'blue',
  data: 'magenta',
  debug: 'gray',
  warning: 'yellow',
  error: 'red',
  success: 'green',
};

colors.setTheme(themesConfig);

function enable() {
  quiet = false;
  return this;
}

function disable() {
  quiet = true;
  return this;
}

function print(str = '') {
  str = is.invalid(str) ? `${buffer}` : `${buffer}${str}`;
  buffer = '';
  if (!quiet) {
    process.stdout.write(str);
  }
  return this;
}

function println(str = '') {
  str = is.invalid(str) ? `${buffer}` : `${buffer}${str}`;
  buffer = '';
  print(str + os.EOL);
  return this;
}

function themes(options = {}) {
  if (!is.empty(options)) {
    Object.assign(themesConfig, options);
    colors.setTheme(themesConfig);
    const self = this;
    Object.keys(themesConfig).forEach((key) => {
      if (!module.exports[key]) {
        module.exports[key] = function (str) {
          println(str[key]);
          return self;
        };
      }
    });
  }
  return themesConfig;
}

function fixed(content, length = 10, fillPosition = 'l', fill = ' ') {
  buffer = `${buffer}${_fixed(content, length, fillPosition, fill)}`;
  return this;
}

function input(str) {
  println(str.input);
  return this;
}

function verbose(str) {
  println(str.verbose);
  return this;
}

function info(str) {
  println(str.info);
  return this;
}

function data(str) {
  println(str.data);
  return this;
}

function debug(str) {
  println(str.debug);
  return this;
}

function warning(...str) {
  str.forEach(s => {
    println(s.warning);
  });
  println();
  return this;
}

function success(...str) {
  println();
  str.forEach(s => {
    println(s.success);
  });
  println();
  return this;
}

function error(...str) {
  str.forEach(s => {
    println(s.error);
  });
  println();
  return this;
}

function yellow(str) {
  print(str.yellow);
  return this;
}

function green(str) {
  print(str.green);
  return this;
}

function red(str) {
  print(str.red);
  return this;
}

module.exports = {
  colors,
  fixed,
  print,
  themes,
  println,
  enable,
  disable,
  input,
  verbose,
  info,
  data,
  debug,
  warning,
  success,
  error,
  yellow,
  green,
  red
};

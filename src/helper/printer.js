'use strict';

/**
 * @require https://github.com/Marak/colors.js
 */

const { _str, _fixed } = require('./str');
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
  str = `${buffer}${_str(str)}`;
  buffer = '';
  if (!quiet) {
    process.stdout.write(str);
  }
  return this;
}

function println(str = '') {
  str = _str(str);
  print(str + os.EOL);
  return this;
}

function themes(options = {}) {
  Object.assign(themesConfig, options);
  return themesConfig;
}

function fixed(content, length = 10, fillPosition = 'l', fill = ' ') {
  buffer = `${buffer}${_fixed(content, length, fillPosition, fill)}`;
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
  input(str) {
    println(str.input);
    return this;
  },
  verbose(str) {
    println(str.verbose);
    return this;
  },
  info(str) {
    println(str.info);
    return this;
  },
  data(str) {
    println(str.data);
    return this;
  },
  debug(str) {
    println(str.debug);
    return this;
  },
  warning(...str) {
    str.forEach(s => {
      println(s.warning);
    });
    println();
    return this;
  },
  success(...str) {
    println();
    str.forEach(s => {
      println(s.success);
    });
    println();
  },
  error(...str) {
    str.forEach(s => {
      println(s.error);
    });
    println();
  },
  yellow(str) {
    print(str.yellow);
    return this;
  },
  green(str) {
    print(str.green);
    return this;
  },
  red(str) {
    print(str.red);
    return this;
  }
};

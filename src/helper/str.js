/* eslint-disable no-extend-native */
'use strict';

const os = require('os');
const debug = require('../debug');
const camelCase = require('camelcase');
const fs = require('./fs');
const is = require('./is');

function _str(s) {
  return is.invalid(s) ? '' : s;
}

function _upper_first(str) {
  if (is.empty(str)) {
    return '';
  }
  if (!is.string(str)) {
    debug.stack('Only supported for string.');
  }
  return str[0].toUpperCase() + str.substring(1);
}

function _lower_first(str) {
  if (is.empty(str)) {
    return '';
  }
  if (!is.string(str)) {
    debug.stack('Only supported for string.');
  }
  return str[0].toLowerCase() + str.substring(1);
}

function _caml_case(name, pascalCase = true) {
  name = _str(name);
  if (!is.string(name)) {
    debug.stack('Only supported for string.');
  }
  return camelCase(name, { pascalCase });
}

function _snake_case(name) {
  name = _str(name);
  if (!is.string(name)) {
    debug.stack('Only supported for string.');
  }
  let res = '';
  let tmp = '';
  for (const c of name) {
    if (/[A-Z|0-9]/.test(c)) {
      tmp += c;
    } else {
      if (tmp.length > 0) {
        res += res === '' ? tmp.toLowerCase() : '_' + tmp.toLowerCase();
        tmp = '';
      }
      res += c;
    }
  }
  if (tmp.length > 0) {
    res += '_' + tmp.toLowerCase();
  }
  res = res.replace(/-/g, '_');
  if (name[0] !== '_' && res[0] === '_') {
    res = res.substr(1);
  }
  return res;
}

function _render(tmpl_string, params = {}, left = '${', right = '}') {
  Object.keys(params).forEach((key) => {
    tmpl_string = tmpl_string.split(left + key + right).join(params[key]);
  });
  return tmpl_string;
}

async function _render_with_file(tmpl_file, params = {}, left = '${', right = '}') {
  if (!await fs._exists(tmpl_file)) {
    throw new Error(`${tmpl_file} not exist.`);
  }
  let tmpl_string = await fs._read(tmpl_file);
  return _render(tmpl_string, params, left, right);
}

function _fixed(content, length = 10, fillPosition = 'l', fill = ' ') {
  content = `${_str(content)}`;
  if (content.length < length) {
    var leftFill = '';
    var rightFill = '';
    if (fillPosition.indexOf('r') === 0) {
      leftFill = fill.repeat(length - content.length);
    } else if (fillPosition.indexOf('c') === 0) {
      var left = Math.floor((length - content.length) / 2);
      leftFill = fill.repeat(left);
      rightFill = fill.repeat(length - content.length - left);
    } else {
      rightFill = fill.repeat(length - content.length);
    }
    fill = fill.repeat(length - content.length);
    content = leftFill + content + rightFill;
  }
  return content;
}

function emitIndent(level = null) {
  let l;
  switch (level) {
  case 'up':
  case 'open':
  case 'begin':
  case 'start':
    l = this.level;
    this.level++;
    break;
  case 'down':
  case 'close':
  case 'end':
    this.level--;
    l = this.level;
    break;
  case null:
    l = 0;
    break;
  case true:
    l = this.level;
    break;
  default:
    l = level;
  }
  return this.config.indent.repeat(l);
}

function _equal_ignore_case(a, b) {
  a = a.toLowerCase();
  b = !b ? '' : b.toLowerCase();
  return a === b;
}

class Emitter {
  constructor(options = {}) {
    this.config = {
      indent: '  ',
      eol: os.EOL,
      level: 0,
      encoding: 'utf8',
      ...options
    };
    this.buffer = '';
    this.level = this.config.level;
  }

  /**
   * 
   * @param {*} str 
   * @param {*} level integer|null|false|string
   */
  emit(str = '', level = null) {
    this.buffer += emitIndent.call(this, level);
    this.buffer += str;
    return this;
  }

  emitln(str = '', level = null) {
    this.emit(str + this.config.eol, level);
    return this;
  }

  output() {
    return this.buffer;
  }
}

module.exports = {
  Emitter,

  _str,
  _fixed,
  _render,
  _caml_case,
  _snake_case,
  _upper_first,
  _lower_first,
  _render_with_file,
  _equal_ignore_case
};

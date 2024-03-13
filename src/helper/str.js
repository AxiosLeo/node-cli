/* eslint-disable no-extend-native */
'use strict';

const os = require('os');
const debug = require('../debug');
const camelCase = require('../lib/camelcase');
const fs = require('./fs');
const is = require('./is');
const crypto = require('crypto');

/**
 * Forced to string
 * @param str
 */
function _str(s) {
  return is.invalid(s) || !is.string(s) ? '' : s;
}

function _len(str) {
  if (str === null) {
    return 0;
  }
  if (typeof str !== 'string') {
    str += '';
  }
  // eslint-disable-next-line no-control-regex
  return str.replace(/[^\x00-\xff]/g, '01').length;
}

/**
 * Converts the first character of a string to upper case
 * @param str 
 */
function _upper_first(str) {
  if (is.empty(str)) {
    return '';
  }
  if (!is.string(str)) {
    debug.stack('Only supported for string.');
  }
  return str[0].toUpperCase() + str.substring(1);
}

/**
 * Converts the first character of a string to lower case.
 * @param str 
 */
function _lower_first(str) {
  if (is.empty(str)) {
    return '';
  }
  if (!is.string(str)) {
    debug.stack('Only supported for string.');
  }
  return str[0].toLowerCase() + str.substring(1);
}

/**
 * Converts the name string to camel case
 * @param name 
 * @param pascalCase 
 */
function _caml_case(name, pascalCase = true) {
  name = _str(name);
  return camelCase(name, {
    pascalCase
  });
}

/**
 * Converts the name string to snake case
 * @param name 
 */
function _snake_case(name) {
  name = _str(name);
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

/**
 * render string by params and template
 * @param tmpl_string 
 * @param params 
 * @param left_tag 
 * @param right_tag 
 */
function _render(tmpl_string, params = {}, left = '${', right = '}') {
  Object.keys(params).forEach((key) => {
    tmpl_string = tmpl_string.split(left + key + right).join(params[key]);
  });
  return tmpl_string;
}

/**
 * render string by params and template file
 * @param tmpl_file 
 * @param params 
 * @param left 
 * @param right 
 */
async function _render_with_file(tmpl_file, params = {}, left = '${', right = '}') {
  if (!await fs._exists(tmpl_file)) {
    throw new Error(`${tmpl_file} not exist.`);
  }
  let tmpl_string = await fs._read(tmpl_file);
  return _render(tmpl_string, params, left, right);
}

/**
 * Pad a string to a certain length with another string
 * @param content 
 * @param length default is 10
 * @param fillPosition right|left
 * @param fill default is blank space " "
 */
function _fixed(content, length = 10, fillPosition = 'r', fill = ' ') {
  content = is.invalid(content) ? '' : `${content}`;
  let len = _len(content);
  if (len < length) {
    var leftFill = '';
    var rightFill = '';
    if (fillPosition.indexOf('l') === 0) {
      leftFill = fill.repeat(length - len);
    } else if (fillPosition.indexOf('c') === 0) {
      var left = Math.floor((length - len) / 2);
      leftFill = fill.repeat(left);
      rightFill = fill.repeat(length - len - left);
    } else {
      rightFill = fill.repeat(length - len);
    }
    fill = fill.repeat(length - len);
    content = leftFill + content + rightFill;
  }
  return content;
}

/**
 * Compare two strings in a case-sensitive manner
 * @param a 
 * @param b 
 */
function _equal_ignore_case(a, b) {
  a = a && is.string(a) ? a.toLowerCase() : '';
  b = b && is.string(b) ? b.toLowerCase() : '';
  return a === b;
}

/**
 * count MD5
 * @param str 
 * @param charset default is utf8
 */
function _md5(str, charset = 'utf8') {
  str = `${str}`;
  const hash = crypto.createHash('md5');
  hash.update(str, charset);
  return hash.digest('hex');
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
   * append string without EOL
   * @param str 
   * @param level integer|null|false|string:(up|open|begin|start, down|close|end)
   */
  emit(str = '', level) {
    this.buffer += this.emitIndent.call(this, level);
    this.buffer += str;
    return this;
  }

  /**
   * append string with EOL
   * @param str 
   * @param level integer|null|false|string:(up|open|begin|start, down|close|end)
   */
  emitln(str = '', level = null) {
    this.emit(str + this.config.eol, level);
    return this;
  }

  /**
   * append rows
   * @param  {string[]} rows 
   */
  emitRows(...rows) {
    rows.forEach(row => {
      this.emitln(row, true);
    });
    return this;
  }

  /**
   * emit indent string
   * @param level integer|null|false|string:(up|open|begin|start, down|close|end)
   */
  emitIndent(level = null) {
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
      case false:
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

  /**
   * curr output content
   */
  output() {
    return this.buffer;
  }
}

function _random(dict = '0123456789abcdf', len = 8) {
  let res = '';
  for (let i = 0; i < len; i++) {
    res += dict[Math.floor(Math.random() * dict.length)];
  }
  return res;
}

module.exports = {
  Emitter,

  _len,
  _str,
  _md5,
  _fixed,
  _render,
  _random,
  _caml_case,
  _snake_case,
  _upper_first,
  _lower_first,
  _render_with_file,
  _equal_ignore_case
};

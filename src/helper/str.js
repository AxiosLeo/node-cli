'use strict';

const camelCase = require('camelcase');
const fs = require('./fs');

function _upper_first(str) {
  if (!str) {
    return '';
  }
  return str[0].toUpperCase() + str.substring(1);
}

function _lower_first(str) {
  if (!str) {
    return '';
  }
  return str[0].toLowerCase() + str.substring(1);
}

function _caml_case(name, pascalCase = true) {
  return camelCase(name, { pascalCase });
}

function _snake_case(name) {
  if (!name) {
    return '';
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
  content = `${content}`;
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

function _str(s){
  return typeof s === 'undefined' || s === null ? '' : s;
}

module.exports = {
  _str,
  _fixed,
  _render,
  _caml_case,
  _snake_case,
  _upper_first,
  _lower_first,
  _render_with_file
};

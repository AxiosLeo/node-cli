'use strict';

const is = require('./is');
const Big = require('big.js');
const { _assign } = require('./obj');

const defaultDigits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * @param {string} num 
 * @param {number} from 
 * @returns {Big}
 */
function _toDecimalist(num, from) {
  let len = num.length;
  let dec = new Big(0);
  let base = new Big(from);
  for (let i = 0; i < len; i++) {
    let pos = defaultDigits.indexOf(num[i]);
    if (pos === -1) {
      throw new Error('Invalid number character: ' + num[i]);
    }
    dec = base.pow(len - i - 1).times(pos).plus(dec);
  }
  return dec;
}

/**
 * @param {Big} num 
 * @param {number} to 
 * @param {string} digits 
 * @returns {string}
 */
function _fromDecimalist(num, to, digits) {
  let res = '';
  let base = new Big(to);
  while (num.gt(0)) {
    let mod = num.mod(base);
    res = digits.charAt(mod) + res;
    num = num.div(base).round(0, 0);
  }
  return res;
}

/**
 * @param {number|string|Big} num 
 * @param {number} from
 * @param {number} to
 * @param {{digits:string,patch:string,length?:number}} options 
 * @returns {{str:string,num:Big,digits:string,length?:number}}
 */
function _number(num, from, to, options = {}) {
  if (to > 62) {
    throw new Error('target base must be less than 62');
  }
  let str = num;
  if (num instanceof Big) {
    str = num.toString();
  } else if (is.number(num)) {
    str = `${num}`;
  }
  const digits = options.digits || defaultDigits;
  const { length } = options;
  let n = from !== 10 ? _toDecimalist(str, from) : new Big(str);
  let res = _fromDecimalist(n, to, digits);
  if (typeof length !== 'undefined' && res.length < length) {
    res = digits.charAt(0).repeat(length - res.length) + res;
  }
  return { str: res, num: n, digits, length };
}

function _array2tree(data, options = {}) {
  if (!is.array(data)) {
    throw new Error('data must be an array');
  }
  const c = _assign({
    parent_index: 'parent_id',
    data_index: 'id',
    child_name: 'child'
  }, options);

  const items = [];
  data.forEach(d => {
    if (typeof d[c.child_name] === 'undefined') {
      d[c.child_name] = [];
    } else {
      throw new Error('child name "' + c.child_name + '" is reserved for child data, please use another name');
    }
    items[d[c.data_index]] = d;
    if (typeof d[c.parent_index] === 'undefined' || typeof d[c.data_index] === 'undefined') {
      throw new Error('data must have "' + c.parent_index + '" and "' + c.data_index + '"');
    }
  });

  const tree = [];
  let n = 0;
  data.forEach(item => {
    if (items[item[c.parent_index]]) {
      items[item[c.parent_index]][c.child_name].push(items[item[c.data_index]]);
    } else {
      tree[n++] = items[item[c.data_index]];
    }
  });
  return tree;
}

function _tree2array(tree, options = {}) {
  if (!is.array(tree)) {
    tree = [tree];
  }
  const c = _assign({
    parent_index: 'parent_id',
    data_index: 'id',
    child_name: 'child'
  }, options);
  const res = [];
  function recurse(data, parent_id) {
    data.forEach(d => {
      const child = d[c.child_name].map(i => i);
      delete d[c.child_name];
      d[c.parent_index] = parent_id || 0;
      res.push(d);
      if (child.length) {
        recurse(child, d[c.data_index]);
      }
    });
  }
  recurse(tree, 0);
  return res;
}

module.exports = {
  _number,
  _array2tree,
  _tree2array,
};

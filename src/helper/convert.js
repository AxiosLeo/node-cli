'use strict';

const is = require('./is');
const Big = require('big.js');

const defaultDigits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * co
 * @param {*} num 
 * @param {number} from 
 * @returns {Big}
 */
function _convertToDecimalist(num, from) {
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
function _convertDecimalist(num, to, digits) {
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
 * @param {number|string} num 
 * @param {number} from
 * @param {number} to
 * @param {{digits:string,patch:string,length?:number}} options 
 * @returns {string}
 */
function _convertNumber(num, from, to, options = {}) {
  if (to > 62) {
    throw new Error('target base must be less than 62');
  }
  if (!is.string(num)) {
    num = `${num}`;
  }
  const digits = options.digits || defaultDigits;
  const { length } = options;
  let n = from !== 10 ? _convertToDecimalist(num, from) : new Big(num);
  let res = _convertDecimalist(n, to, digits);
  if (typeof length !== 'undefined' && res.length < length) {
    res = digits.charAt(0).repeat(length - res.length) + res;
  }
  return res;
}

module.exports = {
  _convertNumber
};

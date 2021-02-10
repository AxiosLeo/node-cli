'use strict';

const fs = require('./fs');

const is = {
  undefined: a => typeof (a) === 'undefined',
  array: a => Array.isArray(a),
  string: a => typeof (a) === 'string',
  number: a => typeof (a) === 'number',
  object: a => a !== null && typeof a === 'object' && Array.isArray(a) === false,
  function: a => typeof (a) === 'function',
  boolean: a => typeof (a) === 'boolean',
  file: async a => await fs._is_file(a),
  dir: async a => await fs._is_dir(a),
  invalid: a => typeof a === 'undefined' || a === null,
  contain: (a, b) => {
    if ((is.array(a) || is.string(a)) && a.indexOf(b) > -1) {
      return true;
    }
    if (is.object(a) && !is.invalid(a[b])) {
      return true;
    }
    return false;
  },
  empty: a => {
    if (typeof a === 'undefined' || a === null || a === '') {
      return true;
    }
    if (is.object(a) && Object.keys(a).length === 0) {
      return true;
    }
    if (is.array(a) && a.length === 0) {
      return true;
    }
    return false;
  }
};

module.exports = is;

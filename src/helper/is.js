'use strict';

const fs = require('./fs');

const is = {
  undefined: a => typeof (a) === 'undefined',
  array: a => Array.isArray(a),
  string: a => typeof (a) === 'string',
  number: a => typeof (a) === 'number',
  object: a => typeof (a) === 'object',
  function: a => typeof (a) === 'function',
  boolean: a => typeof (a) === 'boolean',
  bigint: a => typeof (a) === 'bigint',
  file: async a => fs._is_file(a),
  dir: async a => fs._is_dir(a)
};

module.exports = is;

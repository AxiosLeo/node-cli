'use strict';

const string = require('./snippets/string');
const fs = require('./snippets/fs');

module.exports = {
  ...string,
  ...fs,

  string,
  fs,
};
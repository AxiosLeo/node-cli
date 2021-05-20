'use strict';

module.exports = {
  all: false,
  include: [
    'src/helper/fs.js',
    'src/helper/is.js',
    'src/helper/obj.js',
    'src/helper/str.js',
    'src/printer.js',
    'src/locales.js',
    'src/workflow.js'
  ],
  'watermarks': {
    'lines': [0, 80],
    'functions': [0, 80],
    'branches': [0, 80],
    'statements': [0, 80]
  }
};

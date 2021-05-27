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
    'src/workflow.js',
    'src/command.js'
  ],
  'watermarks': {
    'lines': [80, 95],
    'functions': [80, 95],
    'branches': [80, 95],
    'statements': [80, 95]
  }
};

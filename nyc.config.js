'use strict';

module.exports = {
  all: false,
  include: [
    'src/helper/*.js',
    'src/locales.js'
  ],
  'watermarks': {
    'lines': [0, 80],
    'functions': [0, 80],
    'branches': [0, 80],
    'statements': [0, 80]
  }
};

'use strict';

module.exports = {
  exclude: [
    'coverage',
    'self-coverage',
    'tests/*.js',
    'bin',
    'locales',
    'commands'
  ],
  'watermarks': {
    'lines': [0, 80],
    'functions': [0, 80],
    'branches': [0, 80],
    'statements': [0, 80]
  }
};

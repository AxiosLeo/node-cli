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
    'lines': [0, 100],
    'functions': [0, 100],
    'branches': [0, 100],
    'statements': [0, 100]
  }
};

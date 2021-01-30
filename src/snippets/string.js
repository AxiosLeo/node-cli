'use strict';

function _upper_first(str) {
  if (!str) {
    return '';
  }
  return str[0].toUpperCase() + str.substring(1);
}

module.exports = {
  _upper_first
};
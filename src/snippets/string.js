'use strict';

function _upper_first(str) {
  if (!str) {
    return '';
  }
  return str[0].toUpperCase() + str.substring(1);
}

function _caml_case(name) {
  var arr = name.match(/./g);
  var flag = false;
  for (let i = 0; i < arr.length; i++) {
    var c1 = arr[i];
    if (/[a-z]/.test(c1) && flag) {
      arr[i] = arr[i].toUpperCase();
      flag = false;
    } else if (c1 === '-' || c1 === '_') {
      flag = true;
      arr[i] = '';
    }
  }
  name = arr.join('');
  return name[0].toUpperCase() + name.substring(1);
}

module.exports = {
  _caml_case,
  _upper_first
};
'use strict';

function _flatten(obj, sep = '.') {
  function recurse(curr, prefix, res = {}) {
    if (Array.isArray(curr)) {
      curr.forEach((item, index) => {
        recurse(item, prefix ? `${prefix}${sep}${index}` : `${index}`, res);
      });
    } else if (curr instanceof Object) {
      const keys = Object.keys(curr);
      if (keys.length) {
        keys.forEach((key) => {
          recurse(curr[key], prefix ? `${prefix}${sep}${key}` : `${key}`, res);
        });
      } else if (prefix) {
        res[prefix] = curr;
      }
    } else {
      res[prefix] = curr;
    }
  }
  let output = {};
  recurse(obj, '', output);
  return output;
}

function _unflatten(obj, sep = '.') {
  let output = {};
  Object.keys(obj).forEach(key => {
    if (key.indexOf(sep) !== -1) {
      const keyArr = key.split('.').filter(item => item !== '');
      let currObj = output;
      keyArr.forEach((k, i) => {
        if (typeof currObj[k] === 'undefined') {
          if (i === keyArr.length - 1) {
            currObj[k] = obj[key];
          } else {
            currObj[k] = isNaN(keyArr[i + 1]) ? {} : [];
          }
        }
        currObj = currObj[k];
      });
    } else {
      output[key] = obj[key];
    }
  });
  return output;
}

function _assign(targetObj, ...objs) {
  const res = _flatten(targetObj);
  objs.forEach(obj => {
    Object.assign(res, _flatten(obj));
  });
  Object.assign(targetObj, _unflatten(res));
  return targetObj;
}

module.exports = {
  _assign,
  _flatten,
  _unflatten
};

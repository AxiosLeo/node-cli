'use strict';

const is = require('./is');
const cloneDeep = require('clone-deep');

function _flatten(obj, sep = '.') {
  function recurse(curr, prefix, res) {
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
    return res;
  }
  let output = {};
  output = recurse(obj, '', output);
  return output;
}

function _unflatten(obj, sep = '.') {
  const keys = Object.keys(obj);
  const allNumber = !keys.some(k => {
    if (!k) {
      return true;
    }
    const tmp = k.split(sep);
    return is.number(tmp[0]);
  });
  let output = allNumber ? [] : {};
  Object.keys(obj).forEach(key => {
    if (key.indexOf(sep) !== -1) {
      const keyArr = key.split(sep).filter(item => item !== '');
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
  let sep = '$%#$';
  const res = _flatten(targetObj, sep);
  objs.forEach(obj => {
    Object.assign(res, _flatten(obj, sep));
  });
  Object.assign(targetObj, _unflatten(res, sep));
  return targetObj;
}

function _deep_clone(obj) {
  let copy = cloneDeep(obj);
  return copy;
}

function _array2tree(data, options = {}) {
  if (!is.array(data)) {
    throw new Error('data must be an array');
  }
  const c = _assign({
    parent_index: 'parent_id',
    data_index: 'id',
    child_name: 'child'
  }, options);

  const items = [];
  data.forEach(d => {
    if (typeof d[c.child_name] === 'undefined') {
      d[c.child_name] = [];
    } else {
      throw new Error('child name "' + c.child_name + '" is reserved for child data, please use another name');
    }
    items[d[c.data_index]] = d;
    if (typeof d[c.parent_index] === 'undefined' || typeof d[c.data_index] === 'undefined') {
      throw new Error('data must have "' + c.parent_index + '" and "' + c.data_index + '"');
    }
  });

  const tree = [];
  let n = 0;
  data.forEach(item => {
    if (items[item[c.parent_index]]) {
      items[item[c.parent_index]][c.child_name].push(items[item[c.data_index]]);
    } else {
      tree[n++] = items[item[c.data_index]];
    }
  });
  return tree;
}

function _tree2array(tree, options = {}) {
  if (!is.array(tree)) {
    tree = [tree];
  }
  const c = _assign({
    parent_index: 'parent_id',
    data_index: 'id',
    child_name: 'child'
  }, options);
  const res = [];
  function recurse(data, parent_id) {
    data.forEach(d => {
      const child = d[c.child_name].map(i => i);
      delete d[c.child_name];
      d[c.parent_index] = parent_id || 0;
      res.push(d);
      if (child.length) {
        recurse(child, d[c.data_index]);
      }
    });
  }
  recurse(tree, 0);
  return res;
}

module.exports = {
  _assign,
  _flatten,
  _unflatten,
  _array2tree,
  _tree2array,
  _deep_clone
};

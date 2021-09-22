'use strict';

const { _find_root } = require('./fs');

const find_git_root = async (cwd = null) => {
  return await _find_root('.git', cwd, 'Please executed in the git directory path.');
};

module.exports = {
  path: {
    root: find_git_root
  },
};

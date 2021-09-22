'use strict';

const { _shell } = require('./cmd');
const { _find_root } = require('./fs');

const find_git_root = async (cwd = null) => {
  return await _find_root('.git', cwd, 'Please executed in the git directory path.');
};

const curr_branch_name = async (cwd = null) => {
  cwd = await find_git_root(cwd);
  const res = await _shell('git branch |grep "*"', cwd, false);
  return res.stdout.substr(2).split('\n').join('');
};

module.exports = {
  path: {
    root: find_git_root
  },
  branch: {
    curr: curr_branch_name,
  },
};

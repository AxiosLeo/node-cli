'use strict';

const os = require('os');
const cmd = require('./cmd');
const { _find_root } = require('./fs');

const find_git_root = async (cwd = null) => {
  return await _find_root('.git', cwd, 'Please executed in the git directory path.');
};

const curr_branch_name = async (cwd = null) => {
  cwd = await find_git_root(cwd);
  const res = await cmd._shell('git branch |grep "*"', cwd, false);
  return res.stdout.substr(2).split('\n').join('');
};

const has_branch = async (name, cwd = null) => {
  cwd = await find_git_root(cwd);
  const res = await cmd._shell('git branch |grep ""', cwd, false);
  return res.stdout.indexOf(` ${name + os.EOL}`) > -1;
};

const reset_branch = async (name, cwd = null) => {
  cwd = await find_git_root(cwd);
  const tmp_branch = `reset-tmp-branch-${name}-${new Date().valueOf()}`;
  await cmd._exec('git remote update -p', cwd, false, false);
  await cmd._exec('git remote prune origin', cwd, false, false);
  const curr = await curr_branch_name(cwd);
  if (curr !== name) {
    const has = await has_branch(name, cwd);
    await cmd._exec(`git checkout${!has ? ' -b' : ''} ${name}`, cwd, false, false);
  }
  await cmd._exec(`git checkout -b ${tmp_branch}`, cwd, false, false);
  await cmd._exec(`git branch -D ${name}`, cwd, false, false);
  await cmd._exec(`git checkout -b ${name} --track origin/${name}`, cwd, false, false);
  await cmd._exec(`git branch -D ${tmp_branch}`, cwd, false, false);
};

module.exports = {
  path: { root: find_git_root },
  branch: {
    has: has_branch,
    reset: reset_branch,
    curr: curr_branch_name
  },
};

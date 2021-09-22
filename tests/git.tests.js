'use strict';

const path = require('path');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

const { _shell } = require('../src/helper/cmd');
const { _remove, _copy } = require('../src/helper/fs');
const git = require('../src/helper/git');
const basepath = path.join(__dirname, '../../node-cli-tmp-project');

describe('git test case', function () {
  this.beforeAll(async () => {
    await _copy(path.join(__dirname, '../'), basepath, true);
  });

  this.afterAll(async () => {
    await _remove(basepath);
  });

  describe('find git root', function () {
    it('throw an error If not executed in the git path', function () {
      expect(git.path.root(path.join(__dirname, '../../'))).to.be.rejectedWith('Please executed in the git directory path.');
    });

    it('should be ok to find the git root', async function () {
      const gitpath = path.join(__dirname, '..');
      expect(await git.path.root(path.join(__dirname, '../src/helper/fs.js'))).to.be.equal(gitpath);

      expect(await git.path.root()).to.be.equal(gitpath);
    });
  });

  describe('get current git branch name', function () {
    it('should be ok to get current branch name', async function () {
      expect(!!(await git.branch.curr())).to.be.equal(true);
      const first = await git.branch.curr(basepath);
      expect(!!first.length).to.be.equal(true);
      await _shell('git checkout -b test-tmp-branch', basepath);
      expect(await git.branch.curr(basepath)).to.be.equal('test-tmp-branch');
      await _shell(`git checkout ${first}`, basepath);
      await _shell('git branch -D test-tmp-branch', basepath);
    });
  });
});

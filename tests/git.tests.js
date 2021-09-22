'use strict';

const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const mm = require('mm');
chai.use(require('chai-as-promised'));

const cmd = require('../src/helper/cmd');
const fs = require('../src/helper/fs');
const git = require('../src/helper/git');
const basepath = path.join(__dirname, '../../node-cli-tmp-project');

describe('git test case', function () {
  before(async () => {
    if (!await fs._exists(basepath)) {
      await cmd._shell('git clone https://github.com/AxiosLeo/node-cli.git node-cli-tmp-project', path.join(__dirname, '../../'), false);
    }
    const curr = await git.branch.curr(basepath);
    if (curr !== 'master') {
      await cmd._shell('git checkout master', basepath, false);
    }
  });

  it('throw an error If not executed in the git path', function () {
    expect(git.path.root(path.join(__dirname, '../../'))).to.be.rejectedWith('Please executed in the git directory path.');
  });

  it('should be ok to find the git root', async function () {
    const gitpath = path.join(__dirname, '..');
    expect(await git.path.root(path.join(__dirname, '../src/helper/fs.js'))).to.be.equal(gitpath);

    expect(await git.path.root()).to.be.equal(gitpath);
  });

  it('should be ok to get current branch name', async function () {
    expect(!!(await git.branch.curr())).to.be.true;
    const first = await git.branch.curr(basepath);
    expect(!!first.length).to.be.true;
    await cmd._shell('git checkout -b test-tmp-branch', basepath);
    expect(await git.branch.curr(basepath)).to.be.equal('test-tmp-branch');
    await cmd._shell(`git checkout ${first}`, basepath);
    await cmd._shell('git branch -D test-tmp-branch', basepath);
  });

  it('should be to find a branch', async function () {
    expect(await git.branch.has(await git.branch.curr())).to.be.true;

    const first = await git.branch.curr(basepath);
    expect(await git.branch.has(first, basepath)).to.be.true;

    expect(await git.branch.has('not-exist', basepath)).to.be.false;
  });

  it('should be ok to reset a branch', async function () {
    // no exception thrown
    mm(cmd, '_exec', async function () { return {}; });
    await git.branch.reset('master');

    mm(git, 'has_branch', async function () { return false; });
    await git.branch.reset('master', basepath);
    await git.branch.reset('abc', basepath);

    mm.restore();
  });
});

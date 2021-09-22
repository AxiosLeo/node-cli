'use strict';

const path = require('path');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

const git = require('../src/helper/git');

describe('git test case', function () {
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
});

'use strict';

const expect = require('chai').expect;

const {
  _sleep,
  _sync_foreach,
} = require('../src/helper/cmd');

describe('cmd test case', function () {
  it('sync traverse proimse method for array', async function () {
    let data = [1, 2, 3, 4, 5];
    let count = 0;

    await _sync_foreach(data, async function (item, index) {
      await _sleep(Math.floor(Math.random() * 300));
      // to prove that the async functions are executed sequentially
      count++;
      expect(count).to.be.equal(item);
    });
  });

  it('sync traverse proimse method for object', async function () {
    let count = 0;
    let data = { a: 0, b: 1, c: 2, d: 3, e: 4 };
    await _sync_foreach(data, async function (value, key) {
      await _sleep(Math.floor(Math.random() * 300));
      // to prove that the async functions are executed sequentially
      expect(count).to.be.equal(value);
      count++;
    });
  });

  it('not throw error when sync empty array or object', async function () {
    let data = {};
    await _sync_foreach(data);

    data = [];
    await _sync_foreach(data);
  });
});

'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const {
  _sleep,
  _retry,
  _foreach,
  _parallel,
} = require('../src/helper/cmd');

describe('cmd test case', function () {
  it('sync traverse proimse method for array', async function () {
    let data = [1, 2, 3, 4, 5];
    let count = 0;

    await _foreach(data, async function (item, index) {
      await _sleep(Math.floor(Math.random() * 300));
      // to prove that the async functions are executed sequentially
      count++;
      expect(count).to.be.equal(item);
    });

    const obj = { data };
    await _foreach(obj.data, async () => { });
    expect(obj.data.length).to.be.equal(5);
  });

  it('sync traverse proimse method for object', async function () {
    let count = 0;
    let data = { a: 0, b: 1, c: 2, d: 3, e: 4 };
    await _foreach(data, async function (value, key) {
      await _sleep(Math.floor(Math.random() * 300));
      // to prove that the async functions are executed sequentially
      expect(count).to.be.equal(value);
      count++;
    });
  });

  it('not throw error when sync empty array or object', async function () {
    let data = {};
    await _foreach(data);

    data = [];
    await _foreach(data);
  });

  it('retry should be ok', async function () {
    const callback = sinon.fake();
    callback.alwaysThrew(Error);

    try {
      await _retry(async () => {
        callback();
        throw Error('throw error');
      }, 3);
    } catch (e) {
      expect(callback.callCount).to.be.equal(3);
      expect(e.message).to.be.equal('throw error');
    }
  });

  it('_parallel should be ok', async function () {
    const data = [1, 2, 3];
    await _parallel(data.map((i) => async () => {
      expect(data.indexOf(i) > -1).to.be.true;
    }));
  });
});

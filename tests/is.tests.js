/* eslint-disable no-undefined */
'use strict';

const expect = require('chai').expect;
const is = require('../src/helper/is');
const { Configuration } = require('../main');

describe('is test case', function () {
  it('test case for undefined', async function () {
    let data = {};
    expect(is.undefined(data.undefined)).to.be.true;
    data = [];
    expect(is.undefined(data[0])).to.be.true;
    expect(is.undefined(undefined)).to.be.true;
  });

  it('test case for array', function () {
    expect(is.array([])).to.be.true;
    expect(is.array({})).to.be.false;
    expect(is.array(undefined)).to.be.false;
    expect(is.array(null)).to.be.false;
    expect(is.array('')).to.be.false;
  });

  it('test case for string', function () {
    expect(is.string('')).to.be.true;
    expect(is.string(0)).to.be.false;
    expect(is.string({})).to.be.false;
  });

  it('test case for number', function () {
    expect(is.number(1.123)).to.be.true;
    expect(is.number(1111111111111111111111111)).to.be.true;
    expect(is.number('123')).to.be.false;
  });

  it('test case for integer', function () {
    expect(is.integer(1.123)).to.be.false;
    expect(is.integer(1111111111111111111111111)).to.be.true;
    expect(is.integer('123')).to.be.false;
  });

  it('test case for numeric', function () {
    expect(is.numeric(1)).to.be.true;
    expect(is.numeric('1.23')).to.be.true;
    expect(is.numeric('60s')).to.be.false;
    expect(is.numeric('')).to.be.false;
    expect(is.numeric('0')).to.be.true;
    expect(is.numeric(0)).to.be.true;
    expect(is.numeric(null)).to.be.false;
    expect(is.numeric(-Infinity)).to.be.false;
    expect(is.numeric(Infinity)).to.be.false;
    expect(is.numeric(NaN)).to.be.false;
    expect(is.numeric({})).to.be.false;
  });

  it('test case for object', function () {
    expect(is.object({})).to.be.true;
    let obj = {};
    expect(is.object(obj)).to.be.true;
    expect(is.object([])).to.be.false;
    const config = new Configuration();
    expect(is.object(config)).to.be.true;
  });

  it('test case for function', function () {
    expect(is.func(function name() { })).to.be.true;
    const func = function () { return; };
    expect(is.func(func)).to.be.true;
    const config = new Configuration();
    expect(is.func(config.get)).to.be.true;
  });

  it('test case for boolean', function () {
    expect(is.boolean(true)).to.be.true;
    expect(is.boolean(false)).to.be.true;
  });

  it('test case for file&dir', async function () {
    expect(await is.file(__filename)).to.be.true;
    expect(await is.file(__dirname)).to.be.false;

    expect(await is.dir(__dirname)).to.be.true;
    expect(await is.dir(__filename)).to.be.false;
  });

  it('test case for invalid', function () {
    expect(is.invalid(null)).to.be.true;
    expect(is.invalid(undefined)).to.be.true;
    expect(is.invalid('')).to.be.false;
  });

  it('test case for contain', function () {
    expect(is.contain(['a', 'b'], 'b')).to.be.true;
    expect(is.contain('ab', 'b')).to.be.true;
    expect(is.contain({ b: 'B' }, 'b')).to.be.true;
    expect(is.contain('ab', 'c')).to.be.false;
  });

  it('test case for empty', function () {
    expect(is.empty('')).to.be.true;
    expect(is.empty([])).to.be.true;
    expect(is.empty({})).to.be.true;
    expect(is.empty(undefined)).to.be.true;
    expect(is.empty(null)).to.be.true;
    expect(is.empty(0)).to.be.false;
  });
});

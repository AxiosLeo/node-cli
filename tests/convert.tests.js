'use strict';

const expect = require('chai').expect;
const Big = require('big.js');
const _number = require('../src/helper/convert')._number;

const digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';

describe('convert test case', function () {
  it('convert to decimalist', function () {
    expect(_number(9999, 10, 10).str).to.be.equal('9999');
    expect(_number(new Big(9999), 10, 10).str).to.be.equal('9999');
    expect(_number(61, 10, 62).str).to.be.equal('Z');
    expect(_number(61, 10, 62, { digits }).str).to.be.equal('z');
    expect(_number('z', 62, 10).str).to.be.equal('35');
    expect(_number('z', 62, 10, { digits }).str).to.be.equal('DF');
    expect(_number('z', 62, 10, { digits, length: 4 }).str).to.be.equal('AADF');
    expect(_number('ZZZZZZ', 62, 10).str).to.be.equal('56800235583');
  });

  it('throw error', function () {
    expect(() => _number('$', 62, 10)).to.throw('Invalid number character: $');
    expect(() => _number('z', 62, 63)).to.throw('target base must be less than 62');
  });
});

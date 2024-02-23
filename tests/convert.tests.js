'use strict';

const expect = require('chai').expect;
const _convertNumber = require('../src/helper/convert')._convertNumber;

const digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';

describe('convert test case', function () {
  it('convert to decimalist', function () {
    expect(_convertNumber(61, 10, 62)).to.be.equal('Z');
    expect(_convertNumber(61, 10, 62, { digits })).to.be.equal('z');
    expect(_convertNumber('z', 62, 10)).to.be.equal('35');
    expect(_convertNumber('z', 62, 10, { digits })).to.be.equal('DF');
    expect(_convertNumber('z', 62, 10, { digits, length: 4 })).to.be.equal('AADF');
    expect(_convertNumber('ZZZZZZ', 62, 10)).to.be.equal('56800235583');
  });

  it('throw error', function () {
    expect(() => _convertNumber('$', 62, 10)).to.throw('Invalid number character: $');
    expect(() => _convertNumber('z', 62, 63)).to.throw('target base must be less than 62');
  });
});

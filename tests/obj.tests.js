'use strict';

const expect = require('chai').expect;
const { Configuration } = require('../main');

describe('obj test case', function () {
  it('assign test case', async function () {
    const config = new Configuration();
    config.assign({
      a: {
        b: {
          c: [
            { x: [0, 1, 2] }
          ]
        }
      }
    });
    expect(config.get('a.b.c.0.x.0')).to.be.equal(0);
    config.assign({
      a: {
        b: {}
      },
      z: 'Z'
    });
    expect(config.get('a.b.c.0.x.0')).to.be.equal(0);
    expect(config.get('z')).to.be.equal('Z');
    config.assign({ a: 'A' });
    expect(config.get('a')).to.be.equal('A');
  });
});

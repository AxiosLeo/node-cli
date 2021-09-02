'use strict';

const expect = require('chai').expect;
const { Configuration } = require('../main');
const { _deep_clone } = require('../src/helper/obj');

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

  it('deep clone', function () {
    const obj = {
      a: 'b'
    };
    let clone = obj;
    clone.a = 'A';
    expect(obj.a).to.be.equal('A');
    clone = _deep_clone(obj);
    clone.a = 'string';
    expect(obj.a).to.be.equal('A');

    const complexObj = {
      a: {
        b: {
          c: {
            d: [{ x: '1' }]
          }
        }
      }
    };
    clone = _deep_clone(complexObj);
    clone.a.b.c.d.push({ y: 2 });
    clone.a.b.c.d[0].x = '3';
    expect(complexObj.a.b.c.d.length).to.be.equal(1);
    expect(complexObj.a.b.c.d[0].x).to.be.equal('1');
  });
});

'use strict';

const expect = require('chai').expect;

const Configuration = require('../src/config');

describe('Configuration test case', () => {
  it('init', () => {
    let config = new Configuration();
    expect(config.__sep).to.be.equal('.');
    config = new Configuration({ name: 'test' }, ',');
    expect(config.__sep).to.be.equal(',');
    expect(config.get('name')).to.be.equal('test');
    expect(config.name).to.be.equal('test');

    config.init();
    config.assign(null);
    expect(config.__sep).to.be.equal('.');
  });

  it('get', () => {
    let config = new Configuration({ name: 'abc' });
    let res = config.get('a.b.c', 'test');
    expect(res).to.be.equal('test');
    res = config.get();
    expect(res.name).to.be.equal('abc');
  });

  it('set', () => {
    const config = new Configuration({});
    expect(function () {
      config.set(1, 1);
    }).to.be.throw('Invalid config key');
    config.set('a.b.c.d.e', 1);
    config.set('a.b.c.d.f.1', 1);
    config.set('a.b.z.1.a.b.c', 1);
    config.set('a.b.z.0.a.b.c', 1);
    expect(JSON.stringify(config.get('a'))).to.be.equal(JSON.stringify({
      'b': { 'c': { 'd': { 'e': 1, 'f': [null, 1] } }, 'z': [{ 'a': { 'b': { 'c': 1 } } }, { 'a': { 'b': { 'c': 1 } } }] }
    }));
    config.set('a', []);
    config.set('a.0.0', 'A');
    expect(JSON.stringify(config.get('a'))).to.be.equal(JSON.stringify([['A']]));
  });

  it('validate', () => {
    let config = new Configuration({
      a: '',
      b: 'b',
      // eslint-disable-next-line no-undefined
      c: undefined,
      d: null
    });
    let failed = config.validate();
    expect(failed).to.be.an('array').does.empty;

    failed = config.validate(['a', 'b', 'c', 'd']);
    expect(failed).to.be.an('array').does.not.include('b');

    failed = config.validate('a');
    expect(failed).to.be.an('array').does.include('a');

    failed = config.validate('b');
    expect(failed).to.be.an('array').does.not.include('b');

    expect(function () {
      config.validate({ a: '' });
    }).to.be.throw('Unsupported keys data type: object');
  });
});

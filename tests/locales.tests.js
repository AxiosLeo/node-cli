'use strict';

const path = require('path');
const expect = require('chai').expect;
const { locales } = require('../main');
const { _read_json } = require('../src/helper/fs');

describe('locales test case', function () {
  beforeEach(async function () {
    locales.init({
      dir: path.join(__dirname, '../locales'),
      sets: ['en-US', 'zh-CN']
    });
  });
  it('init with empty lang sets', function () {
    expect(function () {
      locales.init({
        dir: path.join(__dirname, '../locales'),
        sets: []
      });
    }).to.be.throw('locale.sets cannot be empty');
  });
  it('use lang set which is not exist in sets', function () {
    locales.init({
      dir: path.join(__dirname, '../locales'),
      sets: ['zh-CN', 'en-US'],
      use: 'invalid'
    });
    expect(function () {
      locales.use('invalid');
    }).to.be.throw('"invalid" not exist in config.sets which is (zh-CN,en-US)');
  });
  it('translate with zh-CN', async function () {
    let data = await _read_json(path.join(__dirname, '../locales/zh-CN.json'));
    locales.use('zh-CN');
    let keys = Object.keys(data);
    keys.forEach(word => {
      let res = locales.__(word);
      expect(res).to.be.equal(data[word]);
    });
  });
  it('translate with en-US', async function () {
    let data = await _read_json(path.join(__dirname, '../locales/zh-CN.json'));
    let expe = await _read_json(path.join(__dirname, '../locales/en-US.json'));
    locales.use('en-US');
    let keys = Object.keys(data);
    keys.forEach(word => {
      let res = locales.__(word);
      expect(res).to.be.equal(expe[word]);
    });
  });
  it('translate with params', function () {
    locales.use('en-US');
    const res = locales.__('Required option : ${name}', { name: 'name' });
    expect(res).to.be.equal('Required option : name');
  });
  it('translate with invalid string', function () {
    locales.restore();
    expect(locales.__(null)).to.be.equal('');
  });
  it('translate without init locales', function () {
    locales.restore();
    let res = locales.__('translate some word');
    expect(res).to.be.equal('translate some word');

    res = locales.__('translate with ${name} param', { name: 'name' });
    expect(res).to.be.equal('translate with name param');
  });
});

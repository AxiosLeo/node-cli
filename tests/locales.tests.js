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
});

'use strict';

const path = require('path');
const expect = require('chai').expect;
const {
  _list,
  _search,
  _ext,
  _write,
  _remove,
  _exists,
  _read,
  _append,
  _mkdir,
  _read_json,
  _copy,
  _move
} = require('../src/helper/fs');

describe('fs test case', function () {
  it('search files', async function () {
    const ext = _ext(__filename);
    let files = await _search(__dirname, ext);
    expect(files.length).not.to.be.equal(0);
    files = await _search(path.join(__dirname, '../node_modules/'), 'js');
    expect(files.length).not.to.be.equal(0);
    try {
      await _search(__filename);
    } catch (e) {
      expect(e.message).to.be.equal('Only support dir path');
    }
  });
  it('write&read file', async function () {
    let tmp_dir = path.join(__dirname, '../runtime/test-fs1/');
    await _mkdir(tmp_dir);
    const tmp_file = path.join(tmp_dir, 'tmp.txt');
    await _write(tmp_file, 'test content');
    expect(await _exists(tmp_file)).to.be.true;
    expect(await _read(tmp_file)).to.be.equal('test content');
    await _append(tmp_file, ' append content');
    expect(await _read(tmp_file)).to.be.equal('test content append content');
    await _remove(tmp_file);
    expect(await _exists(tmp_file)).to.be.false;
    await _remove(tmp_dir);
  });
  it('read json file', async function () {
    let tmp_dir = path.join(__dirname, '../runtime/test-fs2/');
    const tmp_file = path.join(tmp_dir, 'tmp.json');
    await _write(tmp_file, '{"a":"b"}');
    const obj = await _read_json(tmp_file);
    expect(obj.a).to.be.equal('b');
    await _remove(tmp_file);
    await _remove(tmp_dir);
    try {
      await _remove(path.sep);
    } catch (e) {
      expect(e.message).to.be.equal(`cannot delete root of system with : ${path.sep}`);
    }
    await _remove(tmp_file);
  });
  it('copy&move file', async function () {
    const tmp_dir = path.join(__dirname, '../runtime/test-fs3');
    const target = path.join(tmp_dir, 'fs.tests.js');
    await _copy(__filename, target);
    expect(await _exists(target)).to.be.true;
    await _move(target, path.join(tmp_dir, 'fs2.tests.js'));
    expect(await _exists(path.join(tmp_dir, 'fs2.tests.js'))).to.be.true;
    await _remove(tmp_dir);
  });
  it('recur copy files', async function () {
    const source = path.join(__dirname, '../src/');
    const target = path.join(__dirname, '../runtime/test-fs4');
    await _copy(source, target, true);
    await _copy('not-exist', target, true); // copy with not exist file
    expect(await _exists(path.join(target, 'helper/fs.js'))).to.be.true;
  });
  it('file list in dir', async function () {
    try {
      await _list(__filename);
    } catch (e) {
      expect(e.message).to.be.equal('Only support dir path');
    }
    let files1 = await _list(__dirname);
    expect(files1.length).not.to.be.equal(0);

    let files2 = await _list(__dirname, true);
    expect(files2.length).not.to.be.equal(0);

    expect(files1[0].length < files2[0].length).to.be.true;
  });
});

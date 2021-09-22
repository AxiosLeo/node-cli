'use strict';

const path = require('path');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

const {
  _ext,
  _md5,
  _sync,
  _list,
  _read,
  _copy,
  _move,
  _write,
  _mkdir,
  _search,
  _remove,
  _exists,
  _append,
  _find_root,
  _read_json,
} = require('../src/helper/fs');
const { _sleep } = require('../src/helper/cmd');

describe('fs test case', function () {
  it('_ext', function () {
    // eslint-disable-next-line no-undefined
    expect(_ext(undefined)).to.be.equal('');
    expect(_ext('a.b.c.d')).to.be.equal('d');
  });

  it('search files', async function () {
    const ext = _ext(__filename);
    let files = await _search(__dirname, ext);
    expect(files.length).not.to.be.equal(0);
    files = await _search(path.join(__dirname, '../node_modules/'), 'js');
    expect(files.length).not.to.be.equal(0);

    files = await _search(path.join(__dirname, '../node_modules/'), 'js', false);
    expect(files.length).to.be.equal(0);

    files = await _search(path.join(__dirname, '../node_modules/'));
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

    await _move('not-exist', 'fs2.tests.js');
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
    expect(files1[0]).to.be.equal('cmd.tests.js');

    let files2 = await _list(__dirname, true);
    expect(files2[0].length > files1[0].length).to.be.true;

    expect(files1[0].length < files2[0].length).to.be.true;

    let files3 = await _list(__dirname, false, '.md');
    expect(files3.length).to.be.equal(0);

    let files4 = await _list(__dirname, false, '.js');
    expect(files4.length).to.be.equal(10);
  });

  it('file md5', async () => {
    const filepath = path.join(__dirname, '../runtime/md5_test.txt');
    await _write(filepath, 'some content');
    const file_md5 = await _md5(filepath);
    expect(file_md5).to.be.equal('9893532233caff98cd083a116b013c0b');
    await _remove(filepath);
    expect(await _exists(filepath)).to.be.false;
  });

  it('sync files', async () => {
    // prepare
    const basepath = path.join(__dirname, '../runtime/sync_files');
    if (await _exists(basepath)) {
      await _remove(basepath);
    }
    await _mkdir(basepath);
    const apath = path.join(__dirname, '../runtime/sync_files/a');
    const bpath = path.join(__dirname, '../runtime/sync_files/b');
    await _write(path.join(apath, 'test1.txt'), 'same content');
    await _write(path.join(bpath, 'test1.txt'), 'same content');
    // a file time < b file time
    await _write(path.join(apath, 'test2.txt'), 'some content');
    await _sleep(100);
    await _write(path.join(bpath, 'test2.txt'), 'will remain b file content');
    // a file time > b file time
    await _write(path.join(bpath, 'test3.txt'), 'some content');
    await _sleep(100);
    await _write(path.join(apath, 'test3.txt'), 'will remain a file content');
    // b file not exists
    await _write(path.join(apath, 'test4.txt'), 'from a');
    // a file not exists
    await _write(path.join(apath, 'test5.txt'), 'from b');

    await _sync(apath, bpath);

    // expection
    expect(await _read(path.join(apath, 'test1.txt'))).to.be.equal('same content');
    expect(await _read(path.join(apath, 'test2.txt'))).to.be.equal('will remain b file content');
    expect(await _read(path.join(apath, 'test3.txt'))).to.be.equal('will remain a file content');
    expect(await _read(path.join(apath, 'test4.txt'))).to.be.equal('from a');
    expect(await _read(path.join(apath, 'test5.txt'))).to.be.equal('from b');
  });

  it('file root path', async () => {
    // throw error when subdirectory not find
    expect(_find_root('.not_exist', process.cwd()))
      .to.be.rejectedWith('Please execute the current command in the directory where ".not_exist" is located');
    expect(_find_root('.not_exist', process.cwd(), 'subdirectory not find'))
      .to.be.rejectedWith('subdirectory not find');

    // success find git root
    const gitpath = path.join(__dirname, '..');
    expect(await _find_root('.git', path.join( __dirname, '../src/helper/fs.js'))).to.be.equal(gitpath);

    // use null dir
    expect(await _find_root('.git')).to.be.equal(gitpath);
  });
});

'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('../debug');
const promisify = require('util').promisify;
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

function _ext(filename) {
  let tmp = path.extname(filename || '').split('.');
  return tmp.length > 1 ? tmp.pop() : '';
}

async function _write(filepath, content) {
  const dir = path.dirname(filepath);
  let exist = await exists(dir);
  if (!exist) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(filepath, content);
}

async function _append(filepath, content) {
  await writeFile(filepath, content, { flag: 'a' });
}

async function _read(filepath) {
  return await readFile(filepath, 'utf-8');
}

async function _read_json(filepath) {
  const content = await readFile(path.resolve(filepath), 'utf-8');
  return JSON.parse(content);
}

async function _mkdir(dir) {
  const exist = await exists(dir);
  if (!exist) {
    await mkdir(dir, { recursive: true });
  }
}

async function _exists(filepath) {
  return await exists(filepath);
}

async function _move(source, target) {
  if (await _exists(source)) {
    await _mkdir(path.dirname(target));
    await rename(source, target);
  }
}

async function _copy(source, target) {
  if (await _exists(source)) {
    await _mkdir(path.dirname(target));
    await copyFile(source, target);
  }
}

async function _is_file(filepath) {
  const status = await stat(filepath);
  return status.isFile();
}

async function _is_dir(dirpath) {
  const status = await stat(dirpath);
  return status.isDirectory();
}

async function _search(dir, ext = '*', recur = true) {
  if (!(await _is_dir(dir))) {
    throw new Error('Only support dir path');
  }
  let files = [];
  const exts = ext && ext !== '*' ? ext.split('|') : [];
  const tmp = await readdir(dir);
  await Promise.all(tmp.map(async (filename) => {
    const full = path.join(dir, filename);
    if (await _is_file(full)) {
      const file_ext = _ext(filename);
      if (!exts.length || exts.indexOf(file_ext) > -1) {
        files.push(full);
      }
    } else if (await _is_dir(full) && recur) {
      (await _search(full)).forEach(item => files.push(item));
    }
  }));
  return files;
}

async function _list(dir, full = false) {
  if (!await _is_dir(dir)) {
    throw new Error('Only support dir path');
  }
  const tmp = await readdir(dir);
  if (full) {
    let files = [];
    await Promise.all(tmp.map(async (filename) => {
      const full = path.join(dir, filename);
      files.push(full);
    }));
    return files;
  }
  return tmp;
}

async function _remove(filepath, recur = true) {
  if (filepath === path.sep) {
    debug.stack(`cannot delete root of system with : ${filepath}`);
  }
  if (await _exists(filepath)) {
    if (await _is_file(filepath)) {
      await unlink(filepath);
    } else if (await _is_dir(filepath)) {
      const dir = filepath;
      const files = await readdir(dir);
      await Promise.all(files.map(async (filename) => {
        const full = path.join(dir, filename);
        await _remove(full, recur);
      }));
      await rmdir(filepath);
    }
  }
}

module.exports = {
  _ext,
  _list,
  _read,
  _copy,
  _move,
  _mkdir,
  _write,
  _remove,
  _search,
  _exists,
  _append,
  _is_dir,
  _is_file,
  _read_json
};

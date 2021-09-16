'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('../debug');
const crypto = require('crypto');
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

async function _is_file(filepath) {
  const status = await stat(filepath);
  return status.isFile();
}

async function _is_dir(dirpath) {
  const status = await stat(dirpath);
  return status.isDirectory();
}

async function _copy(source, target, recur = false) {
  if (!await _exists(source)) {
    return;
  }
  if (!recur) {
    await _mkdir(path.dirname(target));
    await copyFile(source, target);
    return;
  }
  if (await _is_dir(source)) {
    const files = await readdir(source);
    await Promise.all(files.map(async (filename) => {
      const full = path.join(source, filename);
      await _copy(full, path.join(target, filename), recur);
    }));
  } else {
    await _mkdir(path.dirname(target));
    await _copy(source, target);
  }
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
    } else if (recur) {
      (await _search(full, ext, recur)).forEach(item => files.push(item));
    }
  }));
  return files;
}

async function _list(dir, full = false, ext = '*') {
  if (!await _is_dir(dir)) {
    throw new Error('Only support dir path');
  }
  const tmp = await readdir(dir);
  let files = [];
  const exts = ext.split('|');
  await Promise.all(tmp.map(async (filename) => {
    if (ext !== '*') {
      const fileext = path.extname(filename);
      if (exts.indexOf(fileext) < 0) {
        return;
      }
    }
    if (full) {
      const full_name = path.join(dir, filename);
      files.push(full_name);
    } else {
      files.push(filename);
    }
  }));
  return files;
}

async function _remove(filepath, recur = true) {
  if (filepath === path.sep) {
    debug.stack(`cannot delete root of system with : ${filepath}`);
  }
  if (await _exists(filepath)) {
    if (await _is_file(filepath)) {
      await unlink(filepath);
    } else {
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

async function _md5(filepath, charset = 'utf8') {
  const hash = crypto.createHash('md5');
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filepath);
    stream.on('data', (chunk) => {
      hash.update(chunk, charset);
    });
    stream.on('end', () => {
      const result = hash.digest('hex');
      resolve(result);
    });
  });
}

async function _sync(source, target, ext = '*', reback = true) {
  const sources = await _search(source, ext);
  while (sources.length) {
    const file = sources.shift();
    const target_file = file.replace(source, target);
    if (await _exists(target_file)) {
      const md5_s = await _md5(file);
      const md5_t = await _md5(target_file);
      if (md5_s !== md5_t) {
        const statS = await stat(file);
        const statT = await stat(target_file);
        if (statS.mtime >= statT.mtime) {
          await _remove(target_file);
          await _copy(file, target_file);
        }
      }
    } else {
      await _copy(file, target_file);
    }
    if (reback) {
      await _sync(target, source, ext, false);
    }
  }
}

module.exports = {
  _ext,
  _md5,
  _sync,
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

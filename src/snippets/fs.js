'use strict';

const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

async function _write(filepath, content) {
  const dir = path.dirname(filepath);
  let exist = await exists(dir);
  if (!exist) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(filepath, content);
}

module.exports = {
  _write
};
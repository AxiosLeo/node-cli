'use strict';

const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const { prompt, Select } = require('enquirer');

async function ask(message = '') {
  const response = await prompt([
    {
      type: 'input',
      name: 'name',
      message: message
    }
  ]);
  return response.name;
}

async function confirm(message = '', default_value = false) {
  const response = await prompt([
    {
      type: 'confirm',
      name: 'name',
      message: message,
      initial: default_value
    }
  ]);
  return response.name;
}

async function select(choices = [], message = '') {
  const prompt = new Select({
    name: 'value',
    message: message,
    choices: choices
  });
  return await prompt.run();
}

function _upperFirst(str) {
  if (!str) {
    return '';
  }
  return str[0].toUpperCase() + str.substring(1);
}

async function _write(filepath, content) {
  const dir = path.dirname(filepath);
  let exist = await exists(dir);
  if (!exist) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(filepath, content);
}

module.exports = {
  ask,
  select,
  confirm,
  _write,
  _upperFirst
};
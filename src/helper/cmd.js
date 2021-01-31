'use strict';

const printer = require('../printer');
const debug = require('../debug');
const promisify = require('util').promisify;
const cp = require('child_process');
const exec = promisify(cp.exec);
const { prompt, Select } = require('enquirer');

async function _shell(cmd, cwd = null, options = {}) {
  if (null === cwd) {
    cwd = process.cwd();
  }
  let result = await exec(cmd, { cwd: cwd, ...options });
  if (result.stderr) {
    printer.error(result.stderr);
  }
  if (result.stdout) {
    debug.dump(result.stdout);
  }
  return result;
}

/**
 * 
 * @param {string} cmd 
 * @param {*} cwd 
 * @param {*} callback 
 */
async function _exec(cmd, cwd, callback, options = {}) {
  Object.assign(options, {
    stdio: 'inherit',
    shell: true,
    cwd: cwd
  });
  const exec = cp.spawn(cmd, options);
  exec.on('exit', async function (code) {
    if (callback) {
      callback(code);
    }
  });
}

async function _confirm(message = '', default_value = false) {
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

async function _select(message = '', choices = [], default_choice = null) {
  const options = {
    name: 'value',
    message: message,
    choices: choices
  };
  if (default_choice && choices.indexOf(default_choice) > -1) {
    options.initial = default_choice;
  }
  const prompt = new Select(options);
  return await prompt.run();
}

async function _ask(message = '', default_value = null) {
  const options = {
    type: 'input',
    name: 'name',
    message: message,
  };
  if (default_value) {
    options.initial = default_value;
  }
  const response = await prompt([
    options
  ]);
  return response.name;
}

module.exports = {
  _ask,
  _exec,
  _shell,
  _select,
  _confirm
};
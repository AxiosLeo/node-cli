'use strict';

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

module.exports = {
  ask,
  select,
  confirm
};
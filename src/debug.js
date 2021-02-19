'use strict';

const os = require('os');
const { prompt } = require('enquirer');

var count = 0;

function dump(...data) {
  data.forEach(d => {
    // eslint-disable-next-line no-console
    console.log(d);
  });
}

function halt(...data) {
  dump(...data);
  process.exit(-1);
}

function jump(jumpNumber = 0, ...data) {
  if (count === jumpNumber) {
    count = 0;
    halt(...data);
  } else {
    count++;
  }
  return count;
}

function stack(...data) {
  let msg = '';
  if (data[0] && typeof data[0] === 'string') {
    msg = data[0];
    data = data.slice(1);
  }
  dump(...data);
  throw new Error(msg);
}

function warning(...data) {
  let msg = '';
  if (data[0] && typeof data[0] === 'string') {
    msg = data[0];
    data = data.slice(1);
  }
  dump(...data);
  if (msg.length) {
    process.stdout.write(`\x1b[33m${os.EOL}[WARNING] ${msg}\x1b[0m${os.EOL}`);
  }
}

async function pause(...data) {
  dump(...data);
  return new Promise((resolve, reject) => {
    prompt([
      {
        type: 'input',
        name: 'name',
        message: '\x1b[33mpause:\x1b[0m input anything to continue...'
      }
    ]).then(res => { resolve(res); }).catch(err => {
      reject(err);
    });
  });
}

function error(...data) {
  let msg = '';
  if (data[0] && typeof data[0] === 'string') {
    msg = data[0];
    data = data.slice(1);
  }
  dump(...data);
  if (msg.length) {
    process.stdout.write(`\x1b[31m${os.EOL}[ERROR] ${msg}\x1b[0m${os.EOL}${os.EOL}`);
  }
  halt();
}

module.exports = {
  dump,
  halt,
  stack,
  jump,
  warning,
  error,
  pause
};

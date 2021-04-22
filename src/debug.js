'use strict';

const os = require('os');
const { prompt } = require('enquirer');

var count = 0;

function dump(...data) {
  if (!data || !data.length) {
    return;
  }
  // eslint-disable-next-line no-console
  data.forEach(d => console.log(d));
}

function halt(...data) {
  const stack = (new Error()).stack;
  let tmp = stack.split(os.EOL);
  let local = tmp[2].indexOf('at Object.jump') > -1 ? tmp[3] : tmp[2];
  process.stdout.write(`\x1b[33mhalt ${local.trim()}\x1b[0m${os.EOL}`);
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

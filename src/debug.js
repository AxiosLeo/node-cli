'use strict';

const os = require('os');
const { prompt } = require('enquirer');
const moment = require('moment');

var count = 0;

function emit(data) {
  // eslint-disable-next-line no-console
  data.forEach(d => console.log(d));
}

function pos(label, color = '33', prefix = '', suffix = '') {
  const stack = (new Error()).stack;
  let tmp = stack.split('\n');
  let local = tmp[3].indexOf('at Object.jump') > -1 ? tmp[4] : tmp[3];
  process.stdout.write(`${prefix}\x1b[${color}m${label} ${local.trim()}\x1b[0m${suffix}${os.EOL}`);
}

function dump(...data) {
  if (!data || !data.length) {
    return;
  }
  pos('dump', '38;5;243');
  emit(data);
}

function log(...data) {
  pos('log', '38;5;243', `\x1b[33m[${moment().format('YYYY-MM-DD HH:mm:ss')}]\x1b[0m `);
  // eslint-disable-next-line no-console
  console.log.apply(this, data);
}

function halt(...data) {
  pos('halt');
  emit(data);
  process.exit(-1);
}

function jump(jumpNumber = 0, ...data) {
  if (count === jumpNumber) {
    count = 0;
    pos('jump', '35');
    emit(data);
    process.exit(-1);
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
  emit(data);
  throw new Error(msg);
}

function warning(...data) {
  let msg = '';
  if (data[0] && typeof data[0] === 'string') {
    msg = data[0];
    data = data.slice(1);
  }
  emit(data);
  if (msg.length) {
    process.stdout.write(`\x1b[33m${os.EOL}[WARNING] ${msg}\x1b[0m${os.EOL}`);
  }
}

async function pause(...data) {
  emit(data);
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
  emit(data);
  if (msg.length) {
    process.stdout.write(`\x1b[31m${os.EOL}[ERROR] ${msg}\x1b[0m${os.EOL}${os.EOL}`);
  }
  process.exit(-1);
}

module.exports = {
  log,
  pos,
  dump,
  halt,
  jump,
  stack,
  error,
  pause,
  warning,
};

'use strict';

const printer = require('./printer');
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
    printer.println(`[WARNING] ${msg}`);
  }
}

async function pause(...data) {
  dump(...data);
  return new Promise((resolve, reject) => { 
    prompt([
      {
        type: 'input',
        name: 'name',
        message: `${'pause:'.yellow} ${'input anything to continue...'.grey}`
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
    printer.println();
    printer.error(`[ERROR] ${msg}`);
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

'use strict';

const os = require('os');
const printer = require('../printer');
const debug = require('../debug');
const promisify = require('util').promisify;
const cp = require('child_process');
const exec = promisify(cp.exec);
const { prompt, Select, MultiSelect } = require('enquirer');
const { _fixed, _len } = require('./str');
const is = require('./is');
const { __ } = require('../locales');
const EventEmitter = require('events');
const { _deep_clone } = require('./obj');

async function _shell(cmd, cwd = null, print = true, throw_error = true) {
  if (null === cwd) {
    cwd = process.cwd();
  }
  try {
    const result = await exec(cmd, { cwd: cwd });
    if (print) {
      if (result.stderr) {
        printer.error(result.stderr);
      }
      if (result.stdout) {
        printer.println(result.stdout);
      }
    }
    return result;
  } catch (e) {
    if (throw_error) {
      throw e;
    }
    return e;
  }
}

/**
 * 
 * @param {string} cmd 
 * @param {*} cwd 
 * @param {Object} options
 */
async function _exec(cmd, cwd = null, options = {}) {
  if (null === cwd) {
    cwd = process.cwd();
  }
  let opts = {
    stdio: 'inherit',
    shell: true,
    cwd: cwd,
    exception: true
  };
  Object.assign(opts, options);
  const exec = cp.spawn(cmd, opts);
  return new Promise((resolve, reject) => {
    exec.on('close', function (code) {
      resolve(code);
    });
    exec.on('error', function (err) {
      if (opts.exception) {
        reject(err);
      } else {
        resolve(err.code);
      }
    });
    exec.on('exit', function (code) {
      if (code) {
        if (opts.exception) {
          reject(new Error(__('The command "${cmd}" exited with code "${code}"', { cmd: cmd, code: code })));
        } else {
          resolve(code);
        }
      } else {
        resolve(code);
      }
    });
  });
}

async function _confirm(message = '', default_value = false) {
  try {
    const response = await prompt([
      {
        type: 'confirm',
        name: 'name',
        message: message,
        initial: default_value
      }
    ]);
    return response.name;
  } catch (e) {
    // cancel with ctrl+c
    process.exit(-1);
  }
}

async function _select(message = '', choices = [], default_choice = null) {
  if (!choices.length) {
    throw new Error('At least one choice must be selectable');
  }
  try {
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
  } catch (e) {
    // cancel with ctrl+c
    process.exit(-1);
  }
}

async function _select_multi(message, choices, default_choice = null, limit = -1) {
  let prompt = new MultiSelect({
    name: 'value',
    message,
    limit: limit < 0 ? choices.length : limit,
    choices,
    initial: default_choice
  });
  return await prompt.run();
}

async function _ask(message = '', default_value = null) {
  try {
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
  } catch (e) {
    // cancel with ctrl+c
    process.exit(-1);
  }
}

function _table(rows = [], headers = [], options = {}) {
  let config = {
    columns_width: [],
    columns_align: [],
    margin_left: 0,
    spacing: '-',
    padding: ' '
  };
  Object.assign(config, options);
  let cols_lens = config.columns_width && config.columns_width.length ? config.columns_width : [];
  const has_headers = headers && is.array(headers) && headers.length;
  if (!cols_lens.length) {
    if (has_headers) {
      headers.map((header, index) => {
        header = `${header}`;
        if (!cols_lens[index]) {
          cols_lens[index] = 0;
        }
        let header_len = _len(header);
        if (cols_lens[index] < header_len) {
          cols_lens[index] = header_len;
        }
      });
    }
    rows.map((row) => {
      row.map((col, index) => {
        col = `${col}`;
        if (!cols_lens[index]) {
          cols_lens[index] = 0;
        }
        let col_len = _len(col);
        if (cols_lens[index] < col_len) {
          cols_lens[index] = col_len;
        }
        return col;
      });
    });
  }
  const indent = ' '.repeat(config.margin_left);
  rows.map((row) => {
    row.map((col, index) => {
      col = `${col}`;
      if (!cols_lens[index]) {
        cols_lens[index] = 0;
      }
      let col_len = _len(col);
      if (cols_lens[index] < col_len) {
        cols_lens[index] = col_len;
      }
    });
  });
  const div = cols_lens.map(col => config.spacing.repeat(col)).join(config.padding);
  // print headers
  if (has_headers) {
    let headers_str = headers.map((header, index) => _fixed(header, cols_lens[index], config.columns_align[index] || 'c')).join(config.padding);
    printer.yellow(`${indent}${headers_str}`).println();
  }
  printer.println(`${indent}${div}`);
  // print rows
  rows.forEach(row => {
    let str = row.map((col, index) => _fixed(`${col}`, cols_lens[index], config.columns_align[index] || 'c', ' ')).join(config.padding);
    printer.println(`${indent}${str}`);
    if (!has_headers) {
      printer.println(`${indent}${div}`);
    }
  });
}

async function _dispatch(opts = [], ways = {}) {
  async function recur(curr_index, opts, ways) {
    if (is.empty(opts[curr_index])) {
      const chioce = Object.keys(ways);
      const action = await _select('', chioce);
      opts.push(action);
      ways = ways[action];
    } else {
      ways = ways[opts[curr_index]];
    }
    if (!is.empty(ways) && is.object(ways)) {
      return recur(curr_index + 1, opts, ways);
    } else if (!is.empty(ways)) {
      return ways;
    }
    return opts.join('_');
  }
  return await recur(0, opts, ways);
}

const mode_list = ['required', 'optional'];

function _check_option(command_name, opts, opt) {
  if (is.empty(opt.name)) {
    debug.stack(__('The option name cannot be empty in "${cmd}" command.', { cmd: command_name }));
  }
  if (is.contain(opts, opt.name)) {
    debug.stack(__('Option Name Duplication "${name}" in "${cmd}" command.', { cmd: command_name, name: opt.name }));
  }
  if (opt.short && is.contain(opts, opt.short)) {
    debug.stack(__('Option Short Name Duplication -${short} for ${name} option in "${cmd}" command.', { cmd: command_name, short: opt.short, name: opt.name }));
  }
  if (opt.mode && !is.contain(mode_list, opt.mode)) {
    debug.warning(__('The mode name "${mode}" is invalid in "${cmd}" command. Valid mode names are "required" or "optional"', { cmd: command_name, mode: opt.mode }));
    opt.mode = 'optional';
  }
}

function _check_argument(command_name, args, arg) {
  if (is.empty(arg.name)) {
    debug.stack(__('The argument name cannot be empty in "${cmd}" command.', { cmd: command_name }));
  }
  if (is.contain(args, arg.name)) {
    debug.stack(__('Argument Name Duplication "${name}" in "${cmd}" command.', { cmd: command_name, name: arg.name }));
  }
  if (arg.mode && !is.contain(mode_list, arg.mode)) {
    debug.warning(__('The mode name "${mode}" is invalid in "${cmd}" command. Valid mode names are "required" or "optional"', { cmd: command_name, mode: arg.mode }));
    arg.mode = 'optional';
  }
}

/**
 * Execute asynchronous tasks in a synchronous manner
 * @param {*} data 
 * @param {*} resolver 
 * @returns {void}
 */
async function _foreach(data, resolver) {
  if (is.empty(data)) {
    return;
  }
  const event = new EventEmitter();
  let datas = _deep_clone(data);
  let keys = [];
  if (is.object(data)) {
    keys = Object.keys(data);
    datas = Object.values(data);
  } else if (!is.array(data)) {
    throw new Error('Unsupported data type : ' + typeof data);
  }
  let index = 0;
  event.on('step', (rows, resolver, index) => {
    const row = rows.shift();
    if (typeof row === 'undefined') {
      event.emit('done');
      return;
    }
    const i = typeof keys[index] !== 'undefined' ? keys[index] : index;
    index++;
    resolver(row, i).then(() => {
      event.emit('step', rows, resolver, index);
    }).catch((err) => event.emit('error', err));
  });
  event.emit('step', datas, resolver, index);
  return new Promise((resolve, reject) => {
    event.on('error', (err) => {
      reject(err);
    });
    event.on('done', () => {
      resolve();
    });
  });
}

class ParallelTask {
  constructor(options = {}) {
    const cpuNumber = os.cpus().length;
    let parallelCount = options.parallelCount || cpuNumber;
    if (parallelCount <= 1) {
      parallelCount = 1;
    } else if (parallelCount > cpuNumber) {
      parallelCount = cpuNumber;
    }
    this.parallelCount = parallelCount;
    this.tasks = [];
    this.runningCount = 0;
    this.options = options;
    this.index = 0;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.tasks.push({
        index: this.index++,
        task,
        resolve,
        reject
      });
      this._run();
    });
  }

  waitAll() {
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (this.runningCount === 0 && this.tasks.length === 0) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  _run() {
    while (this.runningCount < this.parallelCount && this.tasks.length > 0) {
      const { task, resolve, reject } = this.tasks.shift();
      this.runningCount++;
      task().then(resolve, reject).finally(() => {
        this.runningCount--;
        this._run();
      });
    }
  }
}

/**
 * @param {function[]} functions 
 * @param {*} options 
 */
async function _parallel(functions, options = {}) {
  const task = new ParallelTask(options);
  functions.forEach((func) => {
    task.add(func);
  });
  if (typeof options.waitAll === 'undefined' || options.waitAll === true) {
    await task.waitAll();
  }
  return;
}

/**
 * sleep by milliseconds
 * @param {number} ms milliseconds
 * @returns 
 */
async function _sleep(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

/**
 * retry exec some logic
 * @param {Function} handler 
 * @param {number} retry_times
 * @param {number} curr_times 
 */
async function _retry(handler, retry_times = 3, curr_times = 0) {
  curr_times++;
  try {
    await handler(curr_times, retry_times);
  } catch (e) {
    if (curr_times < retry_times) {
      await _retry(handler, retry_times, curr_times);
    } else {
      throw e;
    }
  }
}

module.exports = {
  _ask,
  _exec,
  _retry,
  _sleep,
  _shell,
  _table,
  _select,
  _confirm,
  _foreach,
  _parallel,
  _dispatch,
  _check_option,
  _select_multi,
  _check_argument,
};

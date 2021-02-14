'use strict';

const printer = require('./printer');
const debug = require('./debug');
const { __ } = require('./locales');
const { _confirm, _select, _ask, _table, _check_argument, _check_option } = require('./helper/cmd');
const is = require('./helper/is');
const { _str, _fixed } = require('./helper/str');

function printUsage(config) {
  printer.warning('Usage:');
  printer.green(`  ${config.name}`);
  if (config.options.length) {
    printer.yellow(' [options] ');
  }
  if (config.args.length) {
    if (config.args.some(arg => arg.mode === 'required')) {
      printer.print('[--] ');
    }
    let args = config.args.map(arg => arg.mode === 'required' ? `[${arg.name}]` : `<${arg.name}>`);
    printer.println(args.join(' '));
  } else {
    printer.println();
  }
  printer.println();
}

function printArgsAndOpts(config) {
  let arg_len = Math.max(config.args.map(arg => arg.name.length));
  let len = 0;
  if (config.options.length) {
    printer.warning('Options:');
    let opts = config.options.map(opt => opt.short ? `-${opt.short}, --${opt.name}` : `--${opt.name}`);
    let opt_len = Math.max(opts.map(opt => opt.length));
    len = Math.max(opt_len, arg_len) + 4;
    config.options.forEach((opt, index) => {
      opt.mode === 'required' ? printer.red(' *') : printer.print('  ');
      printer.green(_fixed(opts[index], len)).println(opt.desc ? __(opt.desc) : '');
    });
    printer.println();
  }
  if (config.args.length) {
    if (len === 0) {
      len = arg_len + 4;
    }
    printer.warning('Arguments:');
    config.args.forEach((arg) => {
      arg.mode === 'required' ? printer.red(' *') : printer.print('  ');
      printer.green(_fixed(arg.name, len)).println(arg.desc ? __(arg.desc) : '');
    });
    printer.println();
  }
}

class Command {
  constructor(config = {}) {
    this.config = {
      name: '',
      alias: [],
      desc: '',
      args: [],
      options: [],
      ...config
    };
    this.debug = debug;
    this.printer = printer;
    const cmd_name = this.config.name;
    if (is.empty(cmd_name)) {
      debug.stack(__('The command name cannot be empty, please check the configuration of the command.'));
    }
    // check arguments
    this.args = [];
    this.config.args.forEach((arg) => {
      _check_argument(cmd_name, this.args, arg);
      this.args.push(arg.name);
    });
    // check options
    this.opts = ['help', 'h'];
    this.config.options.forEach((option) => {
      _check_option(cmd_name, this.opts, option);
      this.opts.push(option.name);
      if (option.short) {
        this.opts.push(option.short);
      }
    });
  }

  addArgument(name, desc = '', mode = 'required', default_value = null) {
    const arg = {
      name, desc: _str(desc), mode, default: default_value
    };
    _check_argument(this.config.name, this.args, arg);
    this.config.args.push(arg);
    this.args.push(name);
    return this;
  }

  addOption(name, short = '', desc = '', mode = 'required', default_value = null) {
    const opt = {
      name, short: _str(short), mode, desc: _str(desc), default: default_value
    };
    _check_option(this.config.name, this.opts, opt);
    this.opts.push(name);
    if (short) {
      this.opts.push(short);
    }
    this.config.options.push(opt);
  }

  usage() {
    printer.println();
    if (this.config.desc) {
      printer.warning('Description:');
      printer.print(`  ${__(this.config.desc)}`).println().println();
    }
    printUsage(this.config);
    if (this.config.example) {
      printer.warning('Example:');
      printer.println(`  ${this.config.example}`);
      printer.println();
    }
    printArgsAndOpts(this.config);
  }

  async exec() {
    printer.warning(__('Please override exec() method for ${name} command', { name: this.config.name }));
  }

  async ask(message = '', default_value = null) {
    return await _ask(message, default_value);
  }

  async confirm(message = '', default_value = false) {
    return await _confirm(message, default_value);
  }

  async select(message = '', choices = [], default_choice = null) {
    return await _select(message, choices, default_choice);
  }

  async table(rows = [], headers = []) {
    printer.println();
    _table(rows, headers, {
      margin_left: 4,
      spacing: '-',
      padding: ' '
    });
    printer.println();
  }
}

module.exports = Command;

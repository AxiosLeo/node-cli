'use strict';

const printer = require('./printer');
const debug = require('./debug');
const { __ } = require('./locales');
const { _confirm, _select, _ask, _table } = require('./helper/cmd');
const is = require('./helper/is');

function checkArgument(cmd, args, name) {
  if (is.empty(name)) {
    debug.error(__('The argument name cannot be empty in "${cmd}" command.', { cmd }));
  }
  if (is.contain(args, name)) {
    debug.error(__('Argument Name Duplication "${name}" in "${cmd}" command.', { cmd, name }));
  }
}

function checkOption(cmd, opts, name, short) {
  if (is.empty(name)) {
    debug.error(__('The option name cannot be empty in "${cmd}" command.', { cmd }));
  }
  if (is.contain(opts, name)) {
    debug.error(__('Option Name Duplication "${name}" in "${cmd}" command.', { cmd, name }));
  }
  if (short && is.contain(opts, short)) {
    debug.error(__('Option Short Name Duplication -${short} for ${name} option in "${cmd}" command.', { cmd, short, name }));
  }
}

class Command {
  constructor(config) {
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
      debug.error(__('The command name cannot be empty, please check the configuration of the command.'));
    }
    // check arguments
    this.args = [];
    this.config.args.forEach((arg) => {
      checkArgument(cmd_name, this.args, arg.name);
      this.args.push(arg.name);
    });
    // check options
    this.opts = ['help', 'h'];
    this.config.options.forEach((option) => {
      checkOption(cmd_name, this.opts, option.name);
      this.opts.push(option.name);
      if (option.short) {
        this.opts.push(option.short);
      }
    });
  }

  addArgument(name, desc, mode = 'optional', default_value = null) {
    checkArgument(this.config.name, this.args, name);
    this.config.args.push({
      name, desc, mode, default: default_value
    });
    this.args.push(name);
    return this;
  }

  addOption(name, short, desc, mode = 'optional', default_value = null) {
    checkOption(this.config.name, this.opts, name, short);
    this.opts.push(name);
    if (short) {
      this.opts.push(short);
    }
    this.config.options.push({
      name, short, mode, desc, default: default_value
    });
  }

  usage() {
    printer.println();
    if (this.config.desc) {
      printer.yellow('Description:').println();
      printer.print(`  ${__(this.config.desc)}`).println().println();
    }
    // print usage
    printer.yellow('Usage:').println();
    printer.print(`  ${this.config.name}`);
    if (this.config.options.length) {
      printer.print(' [options]');
    }
    if (this.config.args.length) {
      if (!this.config.args.some(arg => arg.mode === 'required')) {
        printer.print(' [--]');
      }
      this.config.args.forEach((arg) => {
        if (arg.mode === 'optional') {
          printer.print(` [${arg.name}]`);
        } else {
          printer.print(` <${arg.name}>`);
        }
      });
      printer.println().println();
      printer.yellow('Arguments:').println();
      this.config.args.forEach((arg) => {
        printer.print(' ');
        if (arg.mode === 'required') {
          printer.red('*');
        } else {
          printer.print(' ');
        }
        printer.print(printer.fgGreen).fixed(arg.name, 20).print(printer.reset).println(arg.desc ? __(arg.desc) : '');
      });
    } else {
      printer.println();
    }
    if (this.config.options.length) {
      printer.println();
    }
    if (this.config.options.length) {
      printer.yellow('Options:').println();
      this.config.options.forEach((option) => {
        let str = '';
        if (option.short) {
          str += `-${option.short}, `;
        }
        str += `--${option.name}`;
        printer.print(' ');
        if (option.mode === 'required') {
          printer.red('*');
        } else {
          printer.print(' ');
        }
        printer.print(printer.fgGreen).fixed(str, 20).print(printer.reset);
        printer.print(option.desc ? __(option.desc) : '');
        printer.println();
      });
    }
    printer.println();
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

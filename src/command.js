'use strict';

const printer = require('./printer');
const debug = require('./debug');
const { prompt, Select } = require('enquirer');
const { __ } = require('./locales');

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

    // check arguments
    let set = [];
    this.config.args.forEach((arg) => {
      if (set.indexOf(arg.name) > -1) {
        debug.error(`Argument Name Duplication  : ${arg.name}`);
      }
      set.push(arg.name);
    });
    // check options
    set = ['help', 'h'];
    this.config.options.forEach((option) => {
      if (set.indexOf(option.name) > -1) {
        debug.error(`Option Name Duplication : ${option.name}`);
      }
      set.push(option.name);
      if (option.short) {
        if (set.indexOf(option.short) > -1) {
          debug.error(`Option Short Name Duplication : -${option.short} for ${option.name} option`);
        }
        set.push(option.short);
      }
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
    } else {
      printer.println();
    }
  }

  async exec() {
    printer.warning(`Please override exec() method for ${this.config.name} command`);
  }

  async ask(message = '', default_value = null) {
    const response = await prompt([
      {
        type: 'input',
        name: 'name',
        message: message,
        initial: default_value
      }
    ]);
    return response.name;
  }

  async confirm(message = '', default_value = false) {
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

  async select(message = '', choices = [], default_choice = null) {
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
}

module.exports = Command;

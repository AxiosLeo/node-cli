'use strict';

const printer = require('./printer');
const debug = require('./debug');

const defaultInfo = {
  name: '',
  short: '',
  mode: 'optional', // required | optional
  desc: '',
  default: null     // only supported optional mode
};

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
    this.args = {};
    this.argv = [];
    this.options = {};
    this.debug = debug;
    this.printer = printer;
  }

  usage() { }

  hasOption(optionName) {
    return this.options[optionName] ? true : false;
  }

  addArgument(arg) {
    var tmp = defaultInfo;
    Object.assign(tmp, arg);
    this.config.args.push(tmp);
  }

  addOption(option) {
    var tmp = defaultInfo;
    Object.assign(tmp, option);
    this.config.options.push(tmp);
  }

  check(data, msg) {
    if (!data) {
      this.usage();
      printer.error(msg);
      process.exit(-1);
    }
  }

  exec() {
    throw new Error(`Please override exec : ${this.config.name} command`);
  }
}

module.exports = Command;

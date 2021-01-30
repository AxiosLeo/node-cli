'use strict';

const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const { _upper_first, _write } = require('../src/helper');

const { Command, printer } = require('../main');

class MakeCommand extends Command {
  constructor() {
    super({
      name: 'make',
      desc: 'make_command_desc',
      args: [
        {
          name: 'name',
          mode: 'required',
          desc: 'make_command_args_name_desc'
        },
        {
          name: 'output',
          mode: 'required',
          desc: 'make_command_args_output_desc'
        }
      ],
      options: [],
    });
  }

  async exec(args) {
    await this.genCommand(args.output, args.name);
  }

  async genCommand(output_dir, name) {
    name = name.toLowerCase();
    const output_path = path.join(output_dir, `${name}.js`);
    const exist = await exists(output_path);
    if (exist) {
      printer.error(`${name} command file is exist on ${output_path}`);
      await this.addCommand(output_dir, false);
      return;
    }
    let content = '';
    content += `'use strict';
const { Command, printer } = require('@axiosleo/cli-tool');

class ${_upper_first(name)}Command extends Command {
  constructor() {
    super({
      name: '${name}',
      desc: '',
      args: [],
      options: [],
    });
  }
  async exec(args, options, argList, app) {
    printer.println('this is ${name} command');
  }
}

module.exports = ${_upper_first(name)}Command;
`;
    _write(output_path, content);
    printer.println();
    printer.green(`success generate ${name} command on `).println(output_path);
    printer.println();
  }

  async addCommand(output_dir) {
    output_dir = path.resolve(output_dir);
    let exist = await exists(output_dir);
    if (!exist) {
      await mkdir(output_dir, { recursive: true });
    }
    printer.yellow('Continue add command? ');
    printer.println('please input command name. (input "enter" or "ctrl+c" to cancel)', printer.fgWhite);
    const name = await this.ask();
    if (name) {
      await this.genCommand(output_dir, name);
      return await this.addCommand(output_dir, false);
    }
    return;
  }
}

module.exports = MakeCommand;
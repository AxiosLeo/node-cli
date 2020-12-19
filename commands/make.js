'use strict';

const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const { _upperFirst, _write } = require('../src/helper');

const { Command, printer } = require('../main');

class MakeCommand extends Command {
  constructor() {
    super({
      name: 'make',
      desc: 'Make Command Node.js file',
      args: [
        {
          name: 'name',
          mode: 'required',
          desc: 'Command name',
          default: null
        },
        {
          name: 'output',
          mode: 'required',
          desc: 'The commands dir path, like `./commands/`',
          default: process.cwd()
        }
      ],
      options: [],
    });
  }

  async exec(args) {
    const name = args.name;
    await this.genCommand(args.output, name);
  }

  async genCommand(output_dir, name) {
    name = name.toLowerCase();
    const output_path = path.join(output_dir, `${name}.js`);
    const exist = await exists(output_path);
    if (exist) {
      printer.error(`${name} command file is exist on ${output_path}`);
      return await this.addCommand(output_dir, false);
    }
    let content = '';
    content += `'use strict';
const { Command, printer } = require('@axiosleo/cli-tool');

class ${_upperFirst(name)}Example extends Command {
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

module.exports = ${_upperFirst(name)}Command;
`;
    _write(path.join(output_dir, `${name}.js`), content);
  }

  async addCommand(output_dir, first = true) {
    output_dir = path.resolve(output_dir);
    let exist = await exists(output_dir);
    if (!exist) {
      await mkdir(output_dir, { recursive: true });
    }
    printer.yellow(first ? 'Add a command now? ' : 'Continue add command? ');
    printer.println('input command name or input "no" to cancel.', printer.fgWhite);
    const name = await this.ask();
    if (name && name !== 'no') {
      await this.genCommand(output_dir, name);
      printer.success(`success generate ${name} command`);
      return await this.addCommand(output_dir, false);
    }
    return;
  }
}

module.exports = MakeCommand;
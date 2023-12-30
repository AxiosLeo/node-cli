'use strict';

const path = require('path');
const { Command, printer, helper: { fs, str } } = require('..');
const { _exists, _write, _mkdir } = fs;
const { _caml_case } = str;

class MakeCommand extends Command {
  constructor() {
    super({
      name: 'make',
      desc: 'make_command_desc',
    });
    this.addArgument('name', 'make_command_args_name_desc');
    this.addArgument('output', 'make_command_args_output_desc', 'optional', path.join(process.cwd(), './commands/'));
  }

  async exec(args) {
    await this.genCommand(args.output, args.name);
  }

  async genCommand(output_dir, name) {
    name = name.toLowerCase();
    const output_path = path.join(output_dir, `${name}.js`);
    const exist = await _exists(output_path);
    if (exist) {
      printer.error(`${name} command file is exist on ${output_path}`);
      await this.addCommand(output_dir, false);
      return;
    }
    let content = '';
    let name_upper = _caml_case(name, true);
    content += `'use strict';

const { Command, printer } = require('@axiosleo/cli-tool');

/**
 * import more features
 * @import const { Workflow } = require('@axiosleo/cli-tool');
 * @import const { Configuration } = require('@axiosleo/cli-tool');
 * @import const { helper: { fs, cmd, is, obj, str } } = require('@axiosleo/cli-tool');
 * @import const { debug } = require('@axiosleo/cli-tool');
 * @import const { locales } = require('@axiosleo/cli-tool');
 */
class ${name_upper}Command extends Command {
  constructor() {
    super({
      name: '${name}',
      desc: ''
    });
    // this.addArgument('name', 'desc', 'required', null);
    // this.addOption('name', 'n', 'desc', 'required', null);
  }

  /**
   * @param {*} args 
   * @param {*} options 
   * @param {string[]} argList 
   * @param {import('@axiosleo/cli-tool').App} app 
   */
  async exec(args, options, argList, app) {
    printer.println('this is ${name} command');
  }
}

module.exports = ${name_upper}Command;
`;
    _write(output_path, content);
    printer.println();
    printer.green(`success generate ${name} command on `).println(output_path);
    printer.println();
  }

  async addCommand(output_dir) {
    output_dir = path.resolve(output_dir);
    let exist = await _exists(output_dir);
    if (!exist) {
      await _mkdir(output_dir, { recursive: true });
    }
    printer.yellow('Continue add command? ');
    printer.println('please input command name. (input "enter" or "ctrl+c" to cancel)'.white);
    const name = await this.ask();
    if (name) {
      await this.genCommand(output_dir, name);
    }
    return;
  }
}

module.exports = MakeCommand;

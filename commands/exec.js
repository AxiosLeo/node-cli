'use strict';

const path = require('path');
const { Command, printer } = require('..');
const { _exists } = require('../src/helper/fs');

class ExecCommand extends Command {
  constructor() {
    super({
      name: 'exec',
      desc: 'Run command js script directly'
    });
    this.addArgument('filepath', 'Command js script file path', 'required', null);
  }
  async exec(args, _, __, app) {
    const filepath = path.resolve(args.filepath);
    if (!await _exists(filepath)) {
      printer.println().error(`"${args.filepath}" not exists in current directory`);
      process.exit(1);
    }
    const Command = require(filepath);
    const command = new Command();
    const name = command.config.name;
    app.register(filepath);

    const argv = [];
    process.argv.forEach((item, i) => {
      if (i === 2) {
        argv.push(name);
      } else if (i !== 3) {
        argv.push(item);
      }
    });
    process.argv = argv;
    await app.exec(name);
  }
}

module.exports = ExecCommand;

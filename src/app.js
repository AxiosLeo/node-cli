'use strict';

const minimist = require('minimist');
const printer = require('./printer');
const fs = require('fs');
const path = require('path');
const debug = require('./debug');
const promisify = require('util').promisify;
const exists = promisify(fs.exists);
const readdir = promisify(fs.readdir);

const { confirm, select } = require('./helper');

class App {
  constructor(options = {}) {
    this.commands = {};
    this.options = {
      name: 'node-cli',
      version: '0.0.1',
      desc: '',
      commands_dir: '',
      commands_sort: [],
      ...options
    };
  }

  register(Command) {
    const command = new Command();
    const name = command.config.name;
    if (this.commands[name]) {
      printer.error(`${name} command already exist!`);
      process.exit(-1);
    }
    this.commands[name] = command;
    return this;
  }

  async start(options = {}) {
    Object.assign(this.options, options);
    const dir = this.options.commands_dir;
    const exist = await exists(dir);
    if (exist) {
      const commands = await readdir(dir);
      commands.forEach(file => {
        this.register(require(path.join(dir, file)));
      });
    }
    await this.run();
  }

  async run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
      await this.showHelp();
      return;
    }

    const commandName = args[0];
    if (commandName === '-h') {
      await this.showHelp();
      return;
    }
    if (this.commands[commandName]) {
      this.exec(commandName, 3);
      return;
    }

    const matched = [];
    Object.keys(this.commands).forEach((key) => {
      if (key.indexOf(commandName) !== -1) {
        matched.push(this.commands[key]);
      }
    });

    if (matched.length === 0) {
      await this.showHelp();
      if (commandName !== 'help') {
        printer.error(`'${commandName}' command dose not exist.`);
      }
    } else {
      await this.showAmbiguous(commandName, matched);
    }
  }

  async exec(commandName, argvSlice = 2) {
    const command = this.commands[commandName];
    const args = process.argv.slice(argvSlice);

    var commandArgs = command.config.args;
    var commandOpts = command.config.options;

    // set option alias
    var aliasOption = {
      help: 'h',
      quiet: 'q'
    };
    var checkSet = [];
    commandOpts.forEach(opt => {
      if (checkSet.indexOf(opt.name) > -1) {
        printer.error(`  Duplication option : ${opt.name}   `);
        command.usage();
        process.exit(-1);
      }
      checkSet.push(opt.name);
      if (opt.short) {
        if (checkSet.indexOf(opt.short) > -1) {
          printer.error(`  Duplication option short : ${opt.name}(${opt.short})   `);
          command.usage();
          process.exit(-1);
        }
        aliasOption[opt.name] = opt.short;
        checkSet.push(opt.short);
      }
    });

    let argv = minimist(args, {
      alias: aliasOption,
      boolean: true
    });

    if (argv.help === true) {
      command.usage();
      process.exit(0);
    }
    if (argv.quiet === true) {
      printer.quiet(true);
    }

    // set command args value
    checkSet = [];
    commandArgs.forEach((arg, key) => {
      if (checkSet.indexOf(arg.name) > -1) {
        printer.error(`  Duplication argument : ${arg.name}   `);
        command.usage();
        process.exit(-1);
      }
      arg['value'] = argv._[key] ? argv._[key] : '';
      if (arg.mode === 'required' && arg['value'] === '') {
        printer.error(`  Required augument : ${arg.name}   `);
        command.usage();
        process.exit(-1);
      }
      checkSet.push(arg.name);
    });

    commandOpts.forEach(opt => {
      opt['value'] = argv[opt.name] ? argv[opt.name] : '';
      if (opt.mode === 'required' && opt['value'] === '') {
        printer.error(`  Required option : ${opt.name}   `);
        command.usage();
        process.exit(-1);
      }
    });

    var cArgs = {};
    var cOpts = {};
    commandArgs.forEach(arg => {
      if (arg.value === '' && arg.default !== null) {
        arg.value = arg.default;
      }
      cArgs[arg.name] = arg.value;
    });

    commandOpts.forEach(opt => {
      if (opt.value === '' && opt.default !== null) {
        opt.value = opt.default;
      }
      cOpts[opt.name] = opt.value;
      if (opt.short) {
        cOpts[opt.short] = opt.value;
      }
    });

    command.args = cArgs;
    command.options = cOpts;
    command.argv = argv._;

    command.exec(cArgs, cOpts, argv._, this).catch((err) => {
      printer.println()
        .error('exec error :').println()
        .println(err.stack).println();
      process.exit(-1);
    });
  }

  async showAmbiguous(commandName, matched) {
    printer.println();
    if (matched.length > 1) {
      printer.error(`    Command "${commandName}" is ambiguous.`);
      const commands = matched.map(command => command.config.name);
      const name = await select(commands, 'Did you mean one of these?');
      this.exec(name);
    } else {
      const name = matched[0].config.name;
      const res = await confirm(`Did you mean "${matched[0].config.name}" command?`, true);
      if (res) {
        this.exec(name);
      }
    }
  }

  async showHelp() {
    if (this.commands['help']) {
      this.exec('help');
    } else {
      // print header
      printer.println();
      printer.yellow(this.options.name);
      printer.green(` ${this.options.version} `);
      printer.println(this.options.desc).println();

      // print Usage
      printer.warning('Usage:');
      printer.println(`    ${this.options.name} <command> [options] [<args>]`).println();

      // print options
      printer.warning('Options:');
      printer.green('    -h, --help').println('         Display this help message');
      printer.green('    -q, --quiet').println('        Do not output any message').println();

      // print available commands
      const {
        name_max_len,
        command_list,
        group
      } = await this.resolve(this.options.commands_sort, this.options.commands_group);
      printer.warning('Available commands:');
      if (command_list) {
        await Promise.all(command_list.map(async cmd => await this.printCommand(cmd, name_max_len)));
        printer.println();
      }
      const group_list = Object.keys(group);
      for (let i = 0; i < group_list.length; i++) {
        const desc = group_list[i];
        if (group[desc]) {
          printer.println(desc);
          await Promise.all(group[desc].map(async cmd => {
            return await this.printCommand(cmd, name_max_len);
          }));
          printer.println();
        }
      }
    }
  }

  async resolve(sort, group) {
    if (!group) {
      group = {};
    }
    if (!sort || !Array.isArray(sort)) {
      sort = [];
    }
    const group_commands = [];
    Object.keys(group).forEach((key) => {
      group[key].forEach(cmd => {
        if (group_commands.indexOf(cmd) < 0) {
          group_commands.push(cmd);
        }
      });
    });
    const commands = this.commands;
    let name_max_len = 0;
    let desc_max_len = 0;

    // count max length
    Object.keys(commands).forEach((key) => {
      const cmd = commands[key];
      if (!cmd) {
        debug.stack(`load ${key} command error`, cmd);
      }
      const { name, desc } = cmd.config;
      if (name.length > name_max_len) {
        name_max_len = name.length;
      }
      if (desc.length > desc_max_len) {
        desc_max_len = desc.length;
      }
      if (sort.indexOf(name) < 0 && group_commands.indexOf(name) < 0) {
        sort.push(name);
      }
    });

    let command_list = sort.filter(cmd => group_commands.indexOf(cmd) < 0);
    if (command_list.indexOf('help') < 0 && group_commands.indexOf('help') < 0) {
      command_list.push('help');
    }
    return { name_max_len, desc_max_len, command_list, group };
  }

  // print a line for single command
  async printCommand(command_name, max_len) {
    const cmd = this.commands[command_name];
    if (cmd) {
      const { name, desc } = cmd.config;
      printer.print(printer.fgGreen);
      printer.fixed('    ' + name, max_len + 4).print();
      printer.print(printer.reset);
      printer.println('    ' + desc);
      return true;
    } else if (command_name === 'help') {
      printer.print(printer.fgGreen);
      printer.fixed('    help', max_len + 4).print();
      printer.print(printer.reset);
      printer.println('    Print help information');
      return true;
    }
    return false;
  }
}

module.exports = App;

'use strict';

const minimist = require('minimist');
const printer = require('./printer');
const debug = require('./debug');
const Configuration = require('./config');

const { _confirm, _select } = require('./helper/cmd');
const { __, init } = require('./locales');
const { _exists, _search } = require('./helper/fs');

class App {
  constructor(options = {}) {
    this.commands = {};
    this.config = new Configuration({
      name: '',
      version: '',
      desc: '',
      commands_dir: '',
      commands_sort: [],
      locale: {
        sets: [],
        dir: '',
        use: null
      }
    });
    this.config.assign(options);
  }

  locale(options = {}) {
    this.config.assign({
      locale: options
    });
    init(this.config.get('locale'));
  }

  register(Command) {
    const command = new Command();
    const name = command.config.name;
    if (this.commands[name]) {
      debug.error(__('${name} command already exist!', { name: name }));
    }
    this.commands[name] = command;
    return this;
  }

  async start(options = {}) {
    this.config.assign(options);

    // validate options
    const failed = this.config.validate(['name', 'version', 'commands_dir']);
    if (failed && failed.length) {
      debug.error(__('Need setting "${keys}" options for App', { keys: failed.join(', ') }));
    }

    // init commands
    const app = this.config.get();
    const dir = app.commands_dir;
    const exist = await _exists(dir);
    if (exist) {
      const commands = await _search(dir);
      commands.forEach(file => {
        this.register(require(file));
      });
    } else {
      printer.warning(__('commands dir not exist on ${dir}', { dir: app.commands_dir }));
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
    const keys = Object.keys(this.commands);
    for (let i = 0; i < keys.length; i++) {
      const command = this.commands[keys[i]];
      if (command.config.alias && command.config.alias.indexOf(commandName) > -1) {
        this.exec(keys[i], 3);
        return;
      }
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
        debug.error(__('${name} command dose not exist.', { name: commandName }));
      }
    } else {
      this.showAmbiguous(commandName, matched).catch((err) => {
        if (err) {
          printer.println()
            .error('exec error :').println()
            .println(err.stack).println();
          process.exit(-1);
        }
      });
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
        command.usage();
        debug.error(`  ${__('Duplication option : ${name}', { name: opt.name })}   `);
      }
      checkSet.push(opt.name);
      if (opt.short) {
        if (checkSet.indexOf(opt.short) > -1) {
          command.usage();
          debug.error(`  ${__('Duplication option short : ${name}(${short})', { name: opt.name, short: opt.short })}   `);
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
        command.usage();
        debug.error(`  ${__('Duplication argument : ${name}', { name: arg.name })}   `);
      }
      arg['value'] = argv._[key] ? argv._[key] : '';
      if (arg.mode === 'required' && arg['value'] === '') {
        command.usage();
        debug.error(`  ${__('Required argument : ${name}', { name: arg.name })}   `);
      }
      checkSet.push(arg.name);
    });

    commandOpts.forEach(opt => {
      opt['value'] = argv[opt.name] ? argv[opt.name] : '';
      if (opt.mode === 'required' && opt['value'] === '') {
        command.usage();
        debug.error(`  ${__('Required option : ${name}', { name: opt.name })}   `);
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
      if (err) {
        printer.println()
          .error('exec error :').println()
          .println(err.stack).println();
        process.exit(-1);
      }
    });
  }

  async showAmbiguous(commandName, matched) {
    printer.println();
    if (matched.length > 1) {
      printer.error(`    ${__('Command "${name}" is ambiguous.', { name: commandName })}`);
      const commands = matched.map(command => command.config.name);
      const name = await _select(commands, __('Did you mean one of these?'));
      this.exec(name);
    } else {
      const name = matched[0].config.name;
      const res = await _confirm(__('Did you mean "${name}" command?', { name: matched[0].config.name }), true);
      if (res) {
        this.exec(name);
      }
    }
  }

  async showHelp() {
    const app = this.config.get();
    if (this.commands['help']) {
      this.exec('help');
    } else {
      // print header
      printer.println();
      printer.yellow(app.name);
      printer.green(` ${app.version} `);
      printer.println(__(app.desc)).println();

      // print Usage
      printer.warning('Usage:');
      printer.println(`    ${app.name} <command> [options] [<args>]`).println();

      // print options
      printer.warning('Options:');
      printer.green('    -h, --help').println('         ' + __('Display this help message'));
      printer.green('    -q, --quiet').println('        ' + __('Do not output any message')).println();

      // print available commands
      const {
        name_max_len,
        command_list,
        group
      } = await this.resolve(app.commands_sort, app.commands_group);
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
        debug.stack(__('load ${name} command error', { name: key }), cmd);
      }
      let { name, desc } = cmd.config;
      desc = __(desc);
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
    max_len = max_len < 4 ? 4 : max_len;
    if (cmd) {
      let { name, desc } = cmd.config;
      desc = __(desc);
      printer.print(printer.fgGreen);
      printer.fixed('    ' + name, max_len + 4).print();
      printer.print(printer.reset);
      printer.print('    ');
      if (cmd.config.alias && cmd.config.alias.length) {
        printer.print('[');
        printer.print(cmd.config.alias.join('|'));
        printer.print('] ');
      }
      printer.println(desc);
      return true;
    } else if (command_name === 'help') {
      printer.print(printer.fgGreen);
      printer.fixed('    help', max_len + 4).print();
      printer.print(printer.reset);
      printer.println('    ' + __('Print help information'));
      return true;
    }
    return false;
  }
}

module.exports = App;

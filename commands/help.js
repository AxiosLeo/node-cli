'use strict';

const { Command, printer, debug } = require('..');
const { __ } = require('../src/locales');
const { _fixed } = require('../src/helper/str');
const is = require('../src/helper/is');

function resolveCommands(commands, sort, group) {
  if (!group) {
    group = {};
  }
  if (is.empty(sort) || !is.array(sort)) {
    sort = [];
  }

  // resolve by group
  const group_commands = [];
  Object.keys(group).forEach((key) => {
    group[key].forEach(cmd => {
      if (is.contain(group_commands[cmd])) {
        return;
      }
      if (group_commands.indexOf(cmd) < 0) {
        group_commands.push(cmd);
      }
    });
  });

  // resolve by list
  Object.keys(commands).sort().forEach((key) => {
    const cmd = commands[key];
    if (!cmd) {
      debug.stack(__('load ${name} command error', { name: key }), cmd);
    }
    let name = cmd.config.name;
    if (cmd.config.show === false) {
      return;
    }
    if (sort.indexOf(name) < 0 && group_commands.indexOf(name) < 0) {
      sort.push(name);
    }
  });

  let list = sort.filter(cmd => group_commands.indexOf(cmd) < 0);
  if (list.indexOf('help') < 0 && group_commands.indexOf('help') < 0) {
    list.push('help');
  }
  return { list, group };
}

function printCommand(commands, command_name, max_len) {
  const cmd = commands[command_name];
  max_len = max_len < 4 ? 4 : max_len;
  max_len = max_len + 6;
  if (cmd) {
    let { name, desc } = cmd.config;
    desc = is.empty(desc) ? '' : __(desc);
    printer.green(_fixed('  ' + name, max_len));
    if (cmd.config.alias && cmd.config.alias.length) {
      printer.print(`[${cmd.config.alias.join('|')}] `.input);
    }
    printer.println(desc);
  }
}

class HelpCommand extends Command {
  constructor() {
    super({
      name: 'help',
      desc: 'Print help information'
    });
  }
  async exec(_, ___, ____, app) {
    const appconfig = app.config;
    // print header
    printer.println();
    printer.yellow(appconfig.name);
    printer.green(` ${appconfig.version ? 'v' + appconfig.version : ''} `);
    if (appconfig.desc) {
      printer.println(__(appconfig.desc));
    } else {
      printer.println();
    }
    printer.println();

    // print usage
    printer.warning('Usage:');
    printer.green(`  ${appconfig.bin || appconfig.name}`).println(' <command> [options] [<arguments>]').println();

    // print options
    printer.warning('Global Options:');
    let max_len = Math.max(...appconfig.options.map(opt => (opt.short ? `-${opt.short}, --${opt.name}` : `--${opt.name}`).length));
    if (appconfig.options && appconfig.options.length) {
      appconfig.options.forEach(opt => {
        if (opt.mode === 'required') {
          printer.print(' ').red('*');
        } else {
          printer.print('  ');
        }
        let str = opt.short ? `-${opt.short}, --${opt.name}` : `--${opt.name}`;
        printer.green(_fixed(str, max_len + 4));
        if (opt.desc) {
          printer.println(__(opt.desc));
        } else {
          printer.println();
        }
      });
      printer.println();
    }

    // print available commands
    printer.warning('Available commands:');
    max_len = Math.max(...Object.keys(app.commands).map(command_name => command_name.length));
    const {
      list,
      group
    } = resolveCommands(app.commands, appconfig.commands_sort, appconfig.commands_group);
    if (list) {
      list.forEach(cmd => {
        printCommand(app.commands, cmd, max_len);
      });
      printer.println();
    }
    const group_list = Object.keys(group);
    for (let i = 0; i < group_list.length; i++) {
      const desc = group_list[i];
      const check = group[desc].some(cmd => !is.invalid(app.commands[cmd]));
      if (check) {
        if (group[desc]) {
          printer.println(desc);
          group[desc].forEach(cmd => {
            printCommand(app.commands, cmd, max_len);
          });
          printer.println();
        }
      }
    }
  }
}

module.exports = HelpCommand;

'use strict';

const expect = require('chai').expect;

const { Command } = require('../main');

describe('command test case', () => {
  it('init', () => {
    // empty command name
    expect(() => {
      new Command();
    }).to.be.throw('The command name cannot be empty, please check the configuration of the command.');

    const command = new Command({
      name: 'test'
    });
    expect(command.config.name).to.be.equal('test');
  });
  it('add option&argument', () => {
    let command = new Command({
      name: 'test',
      desc: 'command desc',
      alias: ['command-alia1', 'command-alia2'],
      args: [
        {
          name: 'arg1',
          mode: 'optional',
          desc: 'arg desc',
          default: null
        }
      ],
      options: [
        {
          name: 'option1',
          short: 'a',
          mode: 'optional',
          desc: 'option desc',
          default: null
        }
      ]
    });
    command.addOption('option_name', 'o', 'option', 'optional', true);
    command.addOption('require', 'r', 'require option', 'required');
    command.addArgument('arg_name', 'argument', 'optional', true);
    command.addArgument('require_arg', 'required argument', 'required');
    command.usage();
    expect(command.config.args.length).to.be.equal(3);
    expect(command.config.options.length).to.be.equal(3);
  });
  it('not have options', () => {
    const command = new Command({
      name: 'test',
      args: [
        {
          name: 'a',
          mode: 'optional',
          desc: 'arg desc',
          default: null
        }
      ],
    });
    command.usage();
    expect(command.config.args.length).to.be.equal(1);
    expect(command.config.options.length).to.be.equal(0);
  });
  it('cmd methods', () => {
    const command = new Command({
      name: 'test'
    });
    command.table([['Bob', 1000]], ['Name', 'Score']);
    command.exec();
    command.usage();
    expect(command.config.name).to.be.equal('test');

    command.config.desc = 'command description';
    command.config.example = 'command example';
    command.usage();
    expect(command.config.desc).to.be.equal('command description');
    expect(command.config.example).to.be.equal('command example');
  });
});

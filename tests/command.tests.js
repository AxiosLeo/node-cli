'use strict';

const expect = require('chai').expect;
const { Command } = require('../main');

class DemoCommand extends Command {
  constructor() {
    super({
      name: 'example',
      args: [
        { name: 'x' }
      ],
      options: [{ name: 'y' }]
    });
  }
}

describe('commands test case', function () {
  it('init without config', function () {
    class CommandExample extends Command { }
    expect(function () {
      new CommandExample();
    }).to.be.throw('The command name cannot be empty, please check the configuration of the command.');
  });
  it('init success', function () {
    class CommandExample extends Command {
      constructor() {
        super({
          name: 'example',
        });
        this.addArgument('a');
      }
    }
    const command = new CommandExample();
    expect(command.config.name).to.be.equal('example');
  });
  it('check args&opts', function () {
    const command = new DemoCommand();
    expect(function () {
      command.addArgument('');
    }).to.be.throw('The argument name cannot be empty in "example" command.');
    expect(function () {
      command.addArgument('a');
      command.addArgument('a');
    }).to.be.throw('Argument Name Duplication "a" in "example" command.');

    expect(function () {
      command.addOption('');
    }).to.be.throw('The option name cannot be empty in "example" command.');
    expect(function () {
      command.addOption('a');
      command.addOption('a');
    }).to.be.throw('Option Name Duplication "a" in "example" command.');

    command.addArgument('b', '', 'invalid');
    command.addArgument('c', '', 'required');
    command.addOption('b', '', '', 'invalid');
    command.addOption('c', '', '', 'required');
    command.usage();
  });
  it('show table', async function () {
    const command = new DemoCommand();
    command.table([[1, 2]], ['a', 'b']);
  });
});

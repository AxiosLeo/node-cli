# @axiosleo/cli-tool

English | [简体中文](/README-CN.md)

[![NPM version](https://img.shields.io/npm/v/@axiosleo/cli-tool.svg?style=flat-square)](https://npmjs.org/package/@axiosleo/cli-tool)
[![npm download](https://img.shields.io/npm/dm/@axiosleo/cli-tool.svg?style=flat-square)](https://npmjs.org/package/@axiosleo/cli-tool)
[![CI Build Status](https://github.com/AxiosLeo/node-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/AxiosLeo/node-cli/actions/workflows/ci.yml)
[![](https://codecov.io/gh/AxiosLeo/node-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/AxiosLeo/node-cli)
[![License](https://img.shields.io/github/license/AxiosLeo/node-cli?color=%234bc524)](LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli/refs/branch/master)

> Design for quickly developing CLI applications using Node.js
>
> See detail usage from [wiki](https://github.com/AxiosLeo/node-cli/wiki)

## Installation

```bash
npm install @axiosleo/cli-tool
```

## Quickly initialize application

```bash
npm install @axiosleo/cli-tool -g

cli-tool init <app-name>

# make command file
cli-tool make <command-name> <commands-dir-path>
# for example
cli-tool make test ./commands/ # will generate command file on ./commands/test.js

# run command js script
cli-tool exec ./command/test.js
```

## Usage

### Start application

```js
const { App } = require('@axiosleo/cli-tool');
const app = new App({
  name: 'cli-tool',      // cli app command name, required
  version: '1.0.0',      // cli app version, required
  desc: 'cli app description',
  commands_dir: '/path/to/commands/dir/', // will auto load command files
  commands_sort: ['help', ... ],
  commands_group: {
    'group description': ['command_name', ...],
  }
});
app.start();
```

### Run single command

- register with command class

```js
const CommandExample = require('/path/to/your/command/file');
app.register(CommandExample);

app.exec("<command-name>");
```

- register with command object

```js
const CommandExample = require('/path/to/your/command/file');
const command = new CommandExample();
app.register(command);

app.exec("<command-name>");
```

- register with command file path

```js
app.register('/path/to/your/command/file');

app.exec("<command-name>");
```

## Use locales

> The "desc" of CLI Application and Command will be automatically translated by using the locales json file.
>
> locales example json file : [locales](./locales)
>
> see detail from [locales wiki](https://github.com/AxiosLeo/node-cli/wiki/locales)

```js
const path = require('path');
app.locale({
  dir: path.join(__dirname, '../locales'), // /path/to/app/locales/dir
  sets: ['en-US', 'zh-CN'],                // cannot be empty, the first set as default.
});
app.start(); // set locale before start app
```

### Command Class Example

```js
'use strict';

const { Command } = require('@axiosleo/cli-tool');

class CommandExample extends Command {
  constructor() {
    super({
      name: 'command-name',
      desc: 'command desc',
      alias: ['command-alia1', 'command-alia2'],
    });

    /**
     * add argument of current command
     * @param name argument name
     * @param desc argument description
     * @param mode argument mode : required | optional
     * @param default_value only supported on optional mode
     */
    this.addArgument('arg-name', 'desc', 'required', null);

    /**
     * add option of current command
     * @param name option name
     * @param short option short name
     * @param desc option description
     * @param mode option mode : required | optional
     * @param default_value only supported on optional mode
     */
    this.addOption('test', 't', 'desc', 'required', null);
  }

  async exec(args, options, argList, app) {
      // do something in here

      // get arg&option by name
      const arg1 = args.argName;
      const option1 = options.optionName;

      // get arg by index
      const index = 0;
      const arg2 = argList[index];

      // ask for answer
      const answer = await this.ask('Please input your answer');

      // ask for confirm, default value is 'false'
      const confirm = await this.confirm('Confirm do this now?', false);

      // select action
      const action = await this.select('Select an action', ['info', 'update']);

      // print table
      const rows = [
        ['Bob', 2]
      ];
      const head = ['Name', 'Score'];
      this.table(rows, head);
  }
}

module.exports = CommandExample;
```

## License

This project is open-sourced software licensed under the [MIT](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli/refs/branch/master/)

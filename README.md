# @axiosleo/cli-tool

[![NPM version](https://img.shields.io/npm/v/@axiosleo/cli-tool.svg?style=flat-square)](https://npmjs.org/package/@axiosleo/cli-tool)
[![npm download](https://img.shields.io/npm/dm/@axiosleo/cli-tool.svg?style=flat-square)](https://npmjs.org/package/@axiosleo/cli-tool)

> Design for quickly developing CLI applications with Node.js

## Install

```bash
npm install @axiosleo/cli-tool
```

## Quickly create app

```js
const { App } = require('@axiosleo/cli-tool');
const app = new App();
```

## Start command line app

```js
app.start({
  name: 'cli',                  // cli app command name
  desc: 'cli app description',
  version: '1.0.0',
  commands_dir: '/path/to/commands/dir/', // will auto load command files
  commands_sort: ['help', ... ]
});

// or
app.register(require('/path/to/your/command/file'))
   // ... ...
   .register(require('/path/to/your/other-command/file'));
app.run();
```

## Run single command

```js
app.register(require('path/to/your/command/file'));
app.exec("<command-name>");
```

## Command example

```js
'use strict';

const { Command } = require('@axiosleo/cli-tool');

class CommandExample extends Command {
    constructor() {
    super({
      name: 'command-name',
      desc: 'command desc',
      args: [
          {
            name: 'name',     // argument name
            mode: 'optional', // required | optional
            desc: 'arg desc',
            default: null     // only supported optional mode
          }
      ],
      options: [
          {
            name: 'name',     // option name
            short: 'n',       // like 'n'
            mode: 'optional', // required | optional
            desc: 'option desc',
            default: null     // only supported optional mode
          }
      ],
    });
  }

  async exec(args, options, argList, app) {
      // do something in here

      // get arg&option by name
      const arg1 = args.argName;
      const option1 = options.optionName;

      // get arg by index
      const arg2 = argList[index];
  }
}

module.exports = CommandExample;
```

## License

This project is open-sourced software licensed under the [MIT](LICENSE).

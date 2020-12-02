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
  commands_sort: ['help', ... ],
  commands_group: {
    'group description': ['command_name', ...], // will print by group, need @1.0.0 version
  }
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

## Util

- debug

```js
const { debug } = require('@axiosleo/cli-tool');

// debug methods
debug.dump(...anything); // Print anything on the console without exiting the process.
debug.halt(...anything); // Print anything on the console and exiting the process.
debug.jump(trigger_times, ...anything);  // Print anything on the console after the number of triggers is reached.
debug.warning('<message>', ...anything); // Print warning message and not exiting the process.
debug.error('<message>', ...anything);   // Print error message and exiting the process.
debug.stack('<message>', ...anything);   // Print anything on the console and throw an error.
```

- printer

```js
const { printer } = require('@axiosleo/cli-tool');

// Print some string on the console without EOL.
printer.print('<some-string>');

// Print some string on the console with EOL.
printer.println('<some-string>');

// Print fixed-length strings
printer.fixed(content, length = 10, fillPosition = 'l', fill = ' ');
```

## License

This project is open-sourced software licensed under the [MIT](LICENSE).

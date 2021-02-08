'use strict';

const path = require('path');

const { Command, printer, debug, helper: { fs } } = require('../main');
const { _write, _exists, _read } = fs;

class InitCommand extends Command {
  constructor() {
    super({
      name: 'init',
      desc: 'init_command_desc',
    });
    this.addArgument('name', 'init_command_args_name_desc', 'required');
    this.addOption('output', 'o', 'init_command_options_output_desc', 'optional', process.cwd());
  }

  async exec(args, options, argList, app) {
    const name = args.name;
    const output = path.join(options.output, name);
    const exist = await _exists(output);
    if (exist) {
      debug.error(`${output} is exist.`);
    }

    // generate package.json
    const package_meta = {
      'name': name,
      'version': '1.0.0',
      'description': '',
      'bin': {},
      'scripts': {
        'lint': 'eslint --fix src/'
      },
      'license': 'MIT',
      'dependencies': {
        '@axiosleo/cli-tool': '^1'
      },
      'devDependencies': {
        'eslint': '*'
      }
    };
    package_meta['bin'][name] = `./bin/${name}.js`;
    await _write(path.join(output, 'package.json'), JSON.stringify(package_meta, null, 2));
    printer.success('generate package.json');

    // generate binary file
    let content = `#!/usr/bin/env node

'use strict';

const path = require('path');

const { App } = require('@axiosleo/cli-tool');
const app = new App();

app.start({
  name: '${name}',
  version: '1.0.0',
  desc: '',
  commands_dir: path.join(__dirname, '../commands'),
  commands_sort: ['help']
});
`;
    _write(path.join(output, `bin/${name}.js`), content);

    await _write(path.join(output, 'commands/README.md'), `you can write code of commands in here.
or you can use \`cli-tool make <command-name> <command-dir-path>\` to make a command file in here.

command example: 
cli-tool make test ./commands/
`);

    // generate other files
    await _write(path.join(output, '.gitignore'), `node_modules/
runtime/
package-lock.json`);
    await _write(path.join(output, '.eslintrc'), await _read(path.join(__dirname, '../', '.eslintrc')));

    printer.success('done initialize.');
    printer.print('please exec ').yellow('"npm install"').print(' and ').yellow('"npm link"').println(' before use.');
  }
}

module.exports = InitCommand;

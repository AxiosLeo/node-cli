'use strict';

const promisify = require('util').promisify;
const fs = require('fs');
const path = require('path');
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const { Command, printer, debug } = require('../main');

async function _write(filepath, content) {
  const dir = path.dirname(filepath);
  let exist = await exists(dir);
  if (!exist) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(filepath, content);
}

function _upperFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

class InitCommand extends Command {
  constructor() {
    super({
      name: 'init',
      desc: 'Quickly initialize an application.',
      args: [
        {
          name: 'name',
          mode: 'required',
          desc: 'The binary name of cli application',
          default: null
        }
      ],
      options: [
        {
          name: 'output',
          short: 'o',
          mode: 'optional',
          desc: 'output dir path',
          default: process.cwd()
        }
      ],
    });
  }

  async exec(args, options, argList, app) {
    const name = args.name;
    const output = path.join(options.output, name);
    const exist = await exists(output);
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
  name: ${name},
  version: '1.0.0',
  desc: '',
  commands_dir: path.join(__dirname, '../commands'),
  commands_sort:['help']
});
`;
    _write(path.join(output, `bin/${name}.js`), content);

    await this.addCommand(output);

    // generate other files
    const files = ['.gitignore', '.eslintrc'];
    files.map(async file => {
      const content = await readFile(path.join(__dirname, '../', file), 'utf-8');
      await _write(path.join(output, file), content);
    });
    printer.success('done initialize.');
    printer.print('please exec ').yellow('"npm install"').print(' and ').yellow('"npm link"').print(' before use.');
  }

  async addCommand(output, first = true) {
    const exist = await exists(path.join(output, 'commands'));
    if (!exist) {
      await mkdir(path.join(output, 'commands'), { recursive: true });
    }
    printer.yellow(first ? 'Add a command now? ' : 'Continue add command? ');
    printer.println('input command name or input "no" to cancel.', printer.fgWhite);
    const name = await this.ask();
    if (name && name !== 'no') {
      _write(path.join(output, `commands/${name}.js`), `'use strict';

const { Command, printer } = require('@axiosleo/cli-tool');

class ${_upperFirst(name)}Example extends Command {
  constructor() {
    super({
      name: '${name}',
      desc: '',
      args: [],
      options: [],
    });
  }

  async exec(args, options, argList, app) {
    printer.println('this is ${name} command');
  }
}

module.exports = ${_upperFirst(name)}Example;
`);
      printer.success(`generate ${name} command`);
      return await this.addCommand(output, false);
    }
    return;
  }
}

module.exports = InitCommand;
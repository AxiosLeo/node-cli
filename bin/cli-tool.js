#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');

const { App } = require('../main');
const app = new App();

const package_info = fs.readFileSync(path.join(__dirname, '../package.json'));
const meta = JSON.parse(package_info);

app.start({
  name: 'cli',
  version: meta.version,
  desc: meta.description,
  commands_dir: path.join(__dirname, '../commands'),
  commands_sort:['help']
});
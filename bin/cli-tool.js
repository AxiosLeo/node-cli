#!/usr/bin/env node

'use strict';

const path = require('path');
const { App } = require('../main');
const app = new App({
  name: 'cli',
  version: '1.2.3',
  desc: 'application_desc',
  commands_dir: path.join(__dirname, '../commands'),
  commands_sort: ['init', 'make']
});
app.locale({
  dir: path.join(__dirname, '../locales'),
  sets: ['en-US', 'zh-CN']
});
app.start();

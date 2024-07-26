# @axiosleo/cli-tool

[English](/README.md) | 简体中文

[![NPM version](https://img.shields.io/npm/v/@axiosleo/cli-tool.svg?style=flat-square)](https://npmjs.org/package/@axiosleo/cli-tool)
[![npm download](https://img.shields.io/npm/dm/@axiosleo/cli-tool.svg?style=flat-square)](https://npmjs.org/package/@axiosleo/cli-tool)
[![node version](https://img.shields.io/badge/node.js-%3E=_14.0-green.svg?style=flat-square)](http://nodejs.org/download/)
[![CI Build Status](https://github.com/AxiosLeo/node-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/AxiosLeo/node-cli/actions/workflows/ci.yml)
[![](https://codecov.io/gh/AxiosLeo/node-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/AxiosLeo/node-cli)
[![License](https://img.shields.io/github/license/AxiosLeo/node-cli?color=%234bc524)](LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli/refs/branch/master)

> 为了使用 Node.js 快速开发命令行应用而设计
>
> 详见文档 [wiki](https://github.com/AxiosLeo/node-cli/wiki)

## 安装

```bash
npm install @axiosleo/cli-tool
```

## 快速初始化应用

```bash
npm install @axiosleo/cli-tool -g

cli-tool init <app-name>

# 生成命令行脚本文件
cli-tool make <command-name> <commands-dir-path>
# 示例
cli-tool make test ./commands/ # 将会生成 ./commands/test.js 文件

# 直接执行生成的命令行脚本文件
cli-tool exec ./command/test.js
```

## 使用

### 应用入口程序

```js
const { App } = require('@axiosleo/cli-tool');
const app = new App({
  name: 'cli-tool',      // 命令行应用的名称, 必须
  desc: 'cli app description',
  version: '1.0.0',      // 命令行应用的版本, 必须
  commands_dir: '/path/to/commands/dir/', // 将会自动加载目录内的命令行脚本文件
  commands_sort: ['help', ... ],
  commands_group: {
    'group description': ['command_name', ...],
  }
});
app.start();
```

### 执行单个命令

- 通过 Command 类注册命令

```js
const CommandExample = require('/path/to/your/command/file');
app.register(CommandExample);

app.exec("<command-name>");
```

- 通过 Command 对象注册命令

```js
const CommandExample = require('/path/to/your/command/file');
const command = new CommandExample();
app.register(command);

app.exec("<command-name>");
```

- 通过 Command 文件地址注册命令

```js
app.register('/path/to/your/command/file');

app.exec("<command-name>");
```

## 多语言

> 开启多语言模式后，应用和命令的“描述”将会根据配置的 locales json 文件，自动翻译成对应语言
>
> locales 示例 json 文件 : [locales](./locales)
>
> 详见 [locales wiki](https://github.com/AxiosLeo/node-cli/wiki/locales)

```js
const path = require('path');
app.locale({
  dir: path.join(__dirname, '../locales'), // /path/to/app/locales/dir
  sets: ['en-US', 'zh-CN'],                // 不能为空, 且第一个元素为默认值
});
app.start(); // 需要在调用 app.start() 方法前配置 locale
```

### 命令类示例

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

## 许可证

本项目基于 [MIT](LICENSE) 开源协议.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FAxiosLeo%2Fnode-cli/refs/branch/master/)

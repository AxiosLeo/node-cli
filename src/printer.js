'use strict';

let quiet = false;

const os = require('os');
const { _fixed } = require('./helper/str');

module.exports = {
  quiet(quiet_flag) {
    quiet = quiet_flag;
  },
  yellow(content) {
    this.print(this.fgYellow).print(content).print(this.reset);
    return this;
  },
  green(content) {
    this.print(this.fgGreen).print(content).print(this.reset);
    return this;
  },
  red(content) {
    this.print(this.fgRed).print(content).print(this.reset);
    return this;
  },
  success(...data) {
    this.println();
    this.output(this.fgGreen, data);
    this.println();
    return this;
  },
  warning(...data) {
    this.output(this.fgYellow, data);
    this.println();
    return this;
  },
  info(...data) {
    this.output(this.fgBlue, data);
    this.println();
    return this;
  },
  error(...data) {
    this.println();
    this.output(this.fgRed, data);
    this.println();
    return this;
  },
  output(color, data) {
    var content = '';
    data.forEach(str => {
      content += str + os.EOL;
    });
    this.print(color + content + this.reset);
    return this;
  },
  showInfoWithBg(data, bg, fg) {
    var max = 0;
    data.forEach(d => {
      if (d.length > max) {
        max = d.length;
      }
    });
    this.print(bg);
    this.println(' '.repeat(max + 4));
    this.print(fg);
    data.forEach(d => {
      this.print('  ').fixed(d, max).println('  ');
    });
    this.println(' '.repeat(max + 4));
    this.print(this.reset);
    return this;
  },
  print(content, color = null) {
    if (!content) {
      content = this.tmp;
      this.tmp = '';
    } else if (this.tmp) {
      content = this.tmp + content;
      this.tmp = '';
    }
    if (!quiet) {
      if (color) {
        process.stdout.write(color);
        process.stdout.write(content);
        process.stdout.write(this.reset);
      } else {
        process.stdout.write(content);
      }
    }
    return this;
  },
  println(content) {
    if (!content) {
      content = this.tmp;
      this.tmp = '';
    } else if (this.tmp) {
      content = this.tmp + content;
      this.tmp = '';
    }
    if (!quiet) {
      process.stdout.write(content + os.EOL);
    }
    return this;
  },
  fixed(content, length = 10, fillPosition = 'l', fill = ' ') {
    this.tmp = `${this.tmp}${_fixed(content, length, fillPosition, fill)}`;
    return this;
  },
  tmp: '',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fgBlack: '\x1b[30m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

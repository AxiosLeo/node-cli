'use strict';

/**
 * ******************************************************
 * @author https://github.com/Marak/colors.js           *
 * @description reference source code for compatibility *
 * ******************************************************
 *
 * Single-file port of colors@1.4.0, so that this package does not depend on
 * "colors" any more. It behaves like `require('colors')`, including the
 * String.prototype getters ('text'.red, 'text'.bold, ...).
 *
 * The MIT License (MIT)
 *
 * Original Library
 *   - Copyright (c) Marak Squires
 *
 * Additional functionality
 *  - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const os = require('os');
const util = require('util');

/**
 * color support detection
 */

function hasFlag(flag, argv) {
  argv = argv || process.argv;

  const terminatorPos = argv.indexOf('--');
  const prefix = /^-{1,2}/.test(flag) ? '' : '--';
  const pos = argv.indexOf(prefix + flag);

  return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
}

const env = process.env;

let forceColor;
if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
  forceColor = false;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
  forceColor = true;
}
if ('FORCE_COLOR' in env) {
  forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
  if (level === 0) {
    return false;
  }

  return {
    level: level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3,
  };
}

function supportsColor(stream) {
  if (forceColor === false) {
    return 0;
  }

  if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
    return 3;
  }

  if (hasFlag('color=256')) {
    return 2;
  }

  if (stream && !stream.isTTY && forceColor !== true) {
    return 0;
  }

  const min = forceColor ? 1 : 0;

  if (process.platform === 'win32') {
    // Windows 10 build 10586 is the first Windows release that supports 256
    // colors. Windows 10 build 14931 is the first release that supports
    // 16m/TrueColor.
    const osRelease = os.release().split('.');
    if (Number(process.versions.node.split('.')[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }

    return 1;
  }

  if ('CI' in env) {
    const known = ['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function (sign) {
      return sign in env;
    });
    if (known || env.CI_NAME === 'codeship') {
      return 1;
    }

    return min;
  }

  if ('TEAMCITY_VERSION' in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }

  if ('TERM_PROGRAM' in env) {
    const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

    switch (env.TERM_PROGRAM) {
      case 'iTerm.app':
        return version >= 3 ? 3 : 2;
      case 'Hyper':
        return 3;
      case 'Apple_Terminal':
        return 2;
      // No default
    }
  }

  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }

  if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }

  if ('COLORTERM' in env) {
    return 1;
  }

  return min;
}

function getSupportLevel(stream) {
  return translateLevel(supportsColor(stream));
}

/**
 * ANSI styles
 */

const codes = {
  reset: [0, 0],

  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  brightRed: [91, 39],
  brightGreen: [92, 39],
  brightYellow: [93, 39],
  brightBlue: [94, 39],
  brightMagenta: [95, 39],
  brightCyan: [96, 39],
  brightWhite: [97, 39],

  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],

  bgBrightRed: [101, 49],
  bgBrightGreen: [102, 49],
  bgBrightYellow: [103, 49],
  bgBrightBlue: [104, 49],
  bgBrightMagenta: [105, 49],
  bgBrightCyan: [106, 49],
  bgBrightWhite: [107, 49],

  // legacy styles for colors pre v1.0.0
  blackBG: [40, 49],
  redBG: [41, 49],
  greenBG: [42, 49],
  yellowBG: [43, 49],
  blueBG: [44, 49],
  magentaBG: [45, 49],
  cyanBG: [46, 49],
  whiteBG: [47, 49],
};

const ansiStyles = {};
Object.keys(codes).forEach(function (key) {
  const style = [];
  style.open = '\u001b[' + codes[key][0] + 'm';
  style.close = '\u001b[' + codes[key][1] + 'm';
  ansiStyles[key] = style;
});

/**
 * colors
 */

const colors = {};

colors.themes = {};
colors.styles = ansiStyles;
colors.supportsColor = getSupportLevel;
colors.enabled = colors.supportsColor() !== false;

colors.enable = function () {
  colors.enabled = true;
};

colors.disable = function () {
  colors.enabled = false;
};

colors.strip = function (str) {
  // eslint-disable-next-line no-control-regex
  return ('' + str).replace(/\x1B\[\d+m/g, '');
};
colors.stripColors = colors.strip;

colors.stylize = function stylize(str, style) {
  if (!colors.enabled) {
    return str + '';
  }

  const styleMap = ansiStyles[style];

  // Stylize should work for non-ANSI styles, too
  if (!styleMap && style in colors) {
    // Style maps like trap operate as functions on strings;
    // they don't have properties like open or close.
    return colors[style](str);
  }

  return styleMap.open + str + styleMap.close;
};

/**
 * chainable style functions: colors.red.bold('text')
 */

const newLineRegex = /[\r\n]+/g;
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

function escapeStringRegexp(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe, '\\$&');
}

function applyStyle() {
  const args = Array.prototype.slice.call(arguments);

  let str = args.map(function (arg) {
    if (arg !== null && typeof arg !== 'undefined' && arg.constructor === String) {
      return arg;
    }
    return util.inspect(arg);
  }).join(' ');

  if (!colors.enabled || !str) {
    return str;
  }

  const newLinesPresent = str.indexOf('\n') !== -1;
  const nestedStyles = this._styles;

  let i = nestedStyles.length;
  while (i--) {
    const code = ansiStyles[nestedStyles[i]];
    str = code.open + str.replace(code.closeRe, code.open) + code.close;
    if (newLinesPresent) {
      str = str.replace(newLineRegex, function (match) {
        return code.close + match + code.open;
      });
    }
  }

  return str;
}

// the prototype shared by every style function, it carries one getter per style
const proto = function colors() { };

function build(_styles) {
  const builder = function builder() {
    return applyStyle.apply(builder, arguments);
  };
  builder._styles = _styles;
  // a function can only get another prototype this way
  Object.setPrototypeOf(builder, proto);
  return builder;
}

ansiStyles.grey = ansiStyles.gray;
Object.keys(ansiStyles).forEach(function (key) {
  ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
  Object.defineProperty(proto, key, {
    get: function () {
      return build(this._styles.concat(key));
    },
  });
});

/**
 * themes, they also extend String.prototype
 */

function addProperty(name, func) {
  // same attributes as String.prototype.__defineGetter__(name, func)
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(String.prototype, name, {
    get: function () {
      // colors@1.4.0 is sloppy mode code: its getters receive a String object
      return func(Object(this));
    },
    enumerable: true,
    configurable: true,
  });
}

// methods of String that should not be overwritten by a theme
const stringPrototypeBlacklist = [
  '__defineGetter__', '__defineSetter__', '__lookupGetter__',
  '__lookupSetter__', 'charAt', 'constructor', 'hasOwnProperty',
  'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString',
  'valueOf', 'charCodeAt', 'indexOf', 'lastIndexOf', 'length',
  'localeCompare', 'match', 'repeat', 'replace', 'search', 'slice',
  'split', 'substring', 'toLocaleLowerCase', 'toLocaleUpperCase',
  'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight',
];

function applyTheme(theme) {
  Object.keys(theme).forEach(function (prop) {
    if (stringPrototypeBlacklist.indexOf(prop) !== -1) {
      // eslint-disable-next-line no-console
      console.log('warn: '.red + ('String.prototype' + prop).magenta +
        ' is probably something you don\'t want to override.  ' +
        'Ignoring style name');
      return;
    }
    if (typeof theme[prop] === 'string') {
      colors[prop] = colors[theme[prop]];
      addProperty(prop, function (str) {
        return colors[prop](str);
      });
      return;
    }
    const themePropApplicator = function (str) {
      let ret = str;
      for (let t = 0; t < theme[prop].length; t++) {
        ret = colors[theme[prop][t]](ret);
      }
      return ret;
    };
    addProperty(prop, themePropApplicator);
    colors[prop] = function (str) {
      return themePropApplicator(str);
    };
  });
}

colors.setTheme = function (theme) {
  if (typeof theme === 'string') {
    // eslint-disable-next-line no-console
    console.log('colors.setTheme now only accepts an object, not a string. ' +
      'If you are trying to set a theme from a file, it is now your (the ' +
      'caller\'s) responsibility to require the file.  The old syntax ' +
      'looked like colors.setTheme(__dirname + ' +
      '\'/../themes/generic-logging.js\'); The new syntax looks like ' +
      'colors.setTheme(require(__dirname + ' +
      '\'/../themes/generic-logging.js\'));');
    return;
  }
  applyTheme(theme);
};

/**
 * custom formatters
 */

const trapChars = {
  a: ['\u0040', '\u0104', '\u023a', '\u0245', '\u0394', '\u039b', '\u0414'],
  b: ['\u00df', '\u0181', '\u0243', '\u026e', '\u03b2', '\u0e3f'],
  c: ['\u00a9', '\u023b', '\u03fe'],
  d: ['\u00d0', '\u018a', '\u0500', '\u0501', '\u0502', '\u0503'],
  e: ['\u00cb', '\u0115', '\u018e', '\u0258', '\u03a3', '\u03be', '\u04bc', '\u0a6c'],
  f: ['\u04fa'],
  g: ['\u0262'],
  h: ['\u0126', '\u0195', '\u04a2', '\u04ba', '\u04c7', '\u050a'],
  i: ['\u0f0f'],
  j: ['\u0134'],
  k: ['\u0138', '\u04a0', '\u04c3', '\u051e'],
  l: ['\u0139'],
  m: ['\u028d', '\u04cd', '\u04ce', '\u0520', '\u0521', '\u0d69'],
  n: ['\u00d1', '\u014b', '\u019d', '\u0376', '\u03a0', '\u048a'],
  o: ['\u00d8', '\u00f5', '\u00f8', '\u01fe', '\u0298', '\u047a', '\u05dd', '\u06dd', '\u0e4f'],
  p: ['\u01f7', '\u048e'],
  q: ['\u09cd'],
  r: ['\u00ae', '\u01a6', '\u0210', '\u024c', '\u0280', '\u042f'],
  s: ['\u00a7', '\u03de', '\u03df', '\u03e8'],
  t: ['\u0141', '\u0166', '\u0373'],
  u: ['\u01b1', '\u054d'],
  v: ['\u05d8'],
  w: ['\u0428', '\u0460', '\u047c', '\u0d70'],
  x: ['\u04b2', '\u04fe', '\u04fc', '\u04fd'],
  y: ['\u00a5', '\u04b0', '\u04cb'],
  z: ['\u01b5', '\u0240'],
};

colors.trap = function runTheTrap(text, options) {
  let result = '';
  text = text || 'Run the trap, drop the bass';
  text.split('').forEach(function (c) {
    c = c.toLowerCase();
    const chars = trapChars[c] || [' '];
    const rand = Math.floor(Math.random() * chars.length);
    if (typeof trapChars[c] !== 'undefined') {
      result += trapChars[c][rand];
    } else {
      result += c;
    }
  });
  return result;
};

// combining characters
const soul = {
  up: [
    '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311',
    '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307',
    '\u0308', '\u030a', '\u0342', '\u0313', '\u0308', '\u034a',
    '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350',
    '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313',
    '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365',
    '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b',
    '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b',
    '\u0346', '\u031a',
  ],
  down: [
    '\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d',
    '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326',
    '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e',
    '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339',
    '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348',
    '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355',
    '\u0356', '\u0359', '\u035a', '\u0323',
  ],
  mid: [
    '\u0315', '\u031b', '\u0300', '\u0301', '\u0358', '\u0321',
    '\u0322', '\u0327', '\u0328', '\u0334', '\u0335', '\u0336',
    '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362',
    '\u0338', '\u0337', '\u0361', ' \u0489',
  ],
};

function randomNumber(range) {
  return Math.floor(Math.random() * range);
}

colors.zalgo = function zalgo(text, options) {
  text = text || '   he is here   ';
  options = options || {};
  options['up'] = typeof options['up'] !== 'undefined' ? options['up'] : true;
  options['mid'] = typeof options['mid'] !== 'undefined' ? options['mid'] : true;
  options['down'] = typeof options['down'] !== 'undefined' ? options['down'] : true;
  options['size'] = typeof options['size'] !== 'undefined' ? options['size'] : 'maxi';

  let result = '';
  text.split('').forEach(function (character) {
    result = result + character;
    const counts = { up: 0, down: 0, mid: 0 };
    switch (options.size) {
      case 'mini':
        counts.up = randomNumber(8);
        counts.mid = randomNumber(2);
        counts.down = randomNumber(8);
        break;
      case 'maxi':
        counts.up = randomNumber(16) + 3;
        counts.mid = randomNumber(4) + 1;
        counts.down = randomNumber(64) + 3;
        break;
      default:
        counts.up = randomNumber(8) + 1;
        counts.mid = randomNumber(6) / 2;
        counts.down = randomNumber(8) + 1;
        break;
    }

    ['up', 'mid', 'down'].forEach(function (index) {
      for (let i = 0; i <= counts[index]; i++) {
        if (options[index]) {
          result = result + soul[index][randomNumber(soul[index].length)];
        }
      }
    });
  });
  return result;
};

/**
 * maps: one style per letter
 */

colors.maps = {};

colors.maps.america = function (letter, i, exploded) {
  if (letter === ' ') {
    return letter;
  }
  switch (i % 3) {
    case 0: return colors.red(letter);
    case 1: return colors.white(letter);
    case 2: return colors.blue(letter);
  }
};

colors.maps.zebra = function (letter, i, exploded) {
  return i % 2 === 0 ? letter : colors.inverse(letter);
};

// RoY G BiV
const rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta'];

colors.maps.rainbow = function (letter, i, exploded) {
  if (letter === ' ') {
    return letter;
  }
  return colors[rainbowColors[i % rainbowColors.length]](letter);
};

const randomStyles = [
  'underline', 'inverse', 'grey', 'yellow', 'red', 'green',
  'blue', 'white', 'cyan', 'magenta', 'brightYellow', 'brightRed',
  'brightGreen', 'brightBlue', 'brightWhite', 'brightCyan', 'brightMagenta',
];

colors.maps.random = function (letter, i, exploded) {
  if (letter === ' ') {
    return letter;
  }
  return colors[randomStyles[Math.round(Math.random() * (randomStyles.length - 2))]](letter);
};

Object.keys(colors.maps).forEach(function (map) {
  colors[map] = function (str) {
    return str.split('').map(colors.maps[map]).join('');
  };
});

Object.keys(ansiStyles).forEach(function (name) {
  Object.defineProperty(colors, name, {
    get: function () {
      return build([name]);
    },
  });
});

/**
 * 'text'.red, 'text'.strip, 'text'.rainbow ...
 */

addProperty('strip', function (str) {
  return colors.strip(str);
});

addProperty('stripColors', function (str) {
  return colors.strip(str);
});

['trap', 'zalgo', 'zebra', 'rainbow', 'random', 'america'].forEach(function (name) {
  addProperty(name, function (str) {
    return colors[name](str);
  });
});

Object.keys(colors.styles).forEach(function (style) {
  addProperty(style, function (str) {
    return colors.stylize(str, style);
  });
});

module.exports = colors;

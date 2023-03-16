'use strict';

/**
 * ******************************************************
 * @author https://github.com/sindresorhus/os-locale    *
 * @description reference source code for compatibility *
 * ******************************************************
 */

// Mini wrapper around `child_process` to make it behave a little like `execa`.

const promisify = require('util').promisify;
const childProcess = require('child_process');

const execFile = promisify(childProcess.execFile);

/**
@param {string} command
@param {string[]} arguments_
@returns {Promise<import('child_process').ChildProcess>}
*/
async function exec(command, arguments_) {
  const subprocess = await execFile(command, arguments_, { encoding: 'utf8' });
  subprocess.stdout = subprocess.stdout.trim();
  return subprocess;
}

/**
@param {string} command
@param {string[]} arguments_
@returns {string}
*/
function execSync(command, arguments_) {
  return childProcess.execFileSync(command, arguments_, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

module.exports = {
  exec,
  execSync
};

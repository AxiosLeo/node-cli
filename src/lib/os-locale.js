'use strict';

/**
 * ******************************************************
 * @author https://github.com/sindresorhus/os-locale    *
 * @description reference source code for compatibility *
 * ******************************************************
 */

const lcid = require('lcid');
const { exec, execSync } = require('./exec.js');

const defaultOptions = { spawn: true };
const defaultLocale = 'en-US';

async function getStdOut(command, args) {
  return (await exec(command, args)).stdout;
}

function getStdOutSync(command, args) {
  return execSync(command, args);
}

function getEnvLocale(env = process.env) {
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
}

function parseLocale(string) {
  const env = {};
  for (const definition of string.split('\n')) {
    const [key, value] = definition.split('=');
    env[key] = value.replace(/^"|"$/g, '');
  }

  return getEnvLocale(env);
}

function getLocale(string) {
  return (string && string.replace(/[.:].*/, ''));
}

async function getLocales() {
  return getStdOut('locale', ['-a']);
}

function getLocalesSync() {
  return getStdOutSync('locale', ['-a']);
}

function getSupportedLocale(locale, locales = '') {
  return locales.includes(locale) ? locale : defaultLocale;
}

async function getAppleLocale() {
  const results = await Promise.all([
    getStdOut('defaults', ['read', '-globalDomain', 'AppleLocale']),
    getLocales(),
  ]);

  return getSupportedLocale(results[0], results[1]);
}

function getAppleLocaleSync() {
  return getSupportedLocale(
    getStdOutSync('defaults', ['read', '-globalDomain', 'AppleLocale']),
    getLocalesSync(),
  );
}

async function getUnixLocale() {
  return getLocale(parseLocale(await getStdOut('locale')));
}

function getUnixLocaleSync() {
  return getLocale(parseLocale(getStdOutSync('locale')));
}

async function getWinLocale() {
  const stdout = await getStdOut('wmic', ['os', 'get', 'locale']);
  const lcidCode = Number.parseInt(stdout.replace('Locale', ''), 16);

  return lcid.from(lcidCode);
}

function getWinLocaleSync() {
  const stdout = getStdOutSync('wmic', ['os', 'get', 'locale']);
  const lcidCode = Number.parseInt(stdout.replace('Locale', ''), 16);

  return lcid.from(lcidCode);
}

function normalise(input) {
  return input.replace(/_/, '-');
}

const cache = new Map();

async function osLocale(options = defaultOptions) {
  if (cache.has(options.spawn)) {
    return cache.get(options.spawn);
  }

  let locale;

  try {
    const envLocale = getEnvLocale();

    if (envLocale || options.spawn === false) {
      locale = getLocale(envLocale);
    } else if (process.platform === 'win32') {
      locale = await getWinLocale();
    } else if (process.platform === 'darwin') {
      locale = await getAppleLocale();
    } else {
      locale = await getUnixLocale();
    }
  } catch (e) {
    // ignore
  }

  const normalised = normalise(locale || defaultLocale);
  cache.set(options.spawn, normalised);
  return normalised;
}

function osLocaleSync(options = defaultOptions) {
  if (cache.has(options.spawn)) {
    return cache.get(options.spawn);
  }

  let locale;
  try {
    const envLocale = getEnvLocale();

    if (envLocale || options.spawn === false) {
      locale = getLocale(envLocale);
    } else if (process.platform === 'win32') {
      locale = getWinLocaleSync();
    } else if (process.platform === 'darwin') {
      locale = getAppleLocaleSync();
    } else {
      locale = getUnixLocaleSync();
    }
  } catch (e) {
    // ignore
  }

  const normalised = normalise(locale || defaultLocale);
  cache.set(options.spawn, normalised);
  return normalised;
}

module.exports = {
  osLocale,
  osLocaleSync
};

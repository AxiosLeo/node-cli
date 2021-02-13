'use strict';

const expect = require('chai').expect;
const print = require('../src/helper/printer');

describe('print test case', function () {
  it('print some content', function () {
    print.print().println();
    print.input('input').input('intput2');
    print.verbose('verbose').verbose('verbose');
    print.info('info').info('info');
    print.data('data').data('data');
    print.debug('debug').debug('debug');
    print.success('success row 1', 'success row 2');
    print.warning('warning row 1', 'warning row 2');
    print.error('error row 1', 'error row 2');
    print.yellow('yellow').green('yellow');
    print.green('green').red('red');
    print.red('red').yellow('yellow');
    print.fixed('fixed str', 20, 'center').println('eol');
    print.fixed('fixed').println('eol');
    // exec here is ok
    expect(true).to.be.true;
  });
  it('enable&disblae', function () {
    print.disable();
    print.debug('not have color');
    print.enable();
    print.debug('has color');
  });
  it('change themes', function () {
    print.themes();
    print.themes({
      input: 'red'
    });
    print.red('echo input with red color').println();
  });
});

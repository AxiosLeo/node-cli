'use strict';

const expect = require('chai').expect;
const printer = require('../src/printer');

describe('print test case', function () {
  it('print some content', function () {
    printer.print().println();
    printer.input('input').input('intput2');
    printer.verbose('verbose').verbose('verbose');
    printer.info('info').info('info');
    printer.data('data').data('data');
    printer.debug('debug').debug('debug');
    printer.success('success row 1', 'success row 2');
    printer.warning('warning row 1', 'warning row 2');
    printer.error('error row 1', 'error row 2');
    printer.yellow('yellow').green('yellow');
    printer.green('green').red('red');
    printer.red('red').yellow('yellow');
    printer.fixed('fixed str', 20, 'center').println('eol');
    printer.fixed('fixed').println('eol');
    // exec here is ok
    expect(true).to.be.true;
  });

  it('enable&disblae', function () {
    printer.disable();
    printer.debug('not have color');
    printer.enable();
    printer.debug('has color');
  });

  it('change themes', function () {
    printer.themes();
    printer.themes({
      input: 'red',
      custom: ['red', 'underline'],
    });
    printer.input('echo input with red color').println();
    printer.println('echo str with red color and underline'.custom);
  });

  it('custom themes', function () {
    printer.themes({
      custome: 'blue'
    });
    printer.custome('should print blue color string and not throw any exception').println();
  });

  it('print with null', function () {
    printer.print(null).println(null);
  });
});

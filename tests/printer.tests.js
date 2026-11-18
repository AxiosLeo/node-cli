'use strict';

const expect = require('chai').expect;
const printer = require('../src/printer');

describe('print test case', function () {
  it('print some content', function () {
    printer.print().println();
    printer.input('input').input('input');
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
    printer.blue('blue').green('green');
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

  it('flush test', function () {
    // 测试基本的 flush 调用
    printer.flush('Progress: 0%');
    printer.flush('Progress: 50%');
    printer.flush('Progress: 100%');
    printer.println(); // 换行
    
    // 测试链式调用
    printer.fixed('Loading', 10).flush();
    printer.fixed('Loading.', 10).flush();
    printer.fixed('Loading..', 10).flush();
    printer.fixed('Loading...', 10).flush();
    printer.println(); // 换行
    
    // 测试 flush 与 quiet 模式
    printer.disable();
    printer.flush('This should not display');
    printer.enable();
    printer.flush('This should display');
    printer.println();
    
    // 测试 flush 参数为空
    printer.flush();
    printer.println();
    
    // exec here is ok
    expect(true).to.be.true;
  });
});

describe('colors test case', function () {
  const colors = printer.colors;
  let enabled;

  before(function () {
    // colors are turned off on CI, enable them to assert the escape codes
    enabled = colors.enabled;
    colors.enable();
  });

  after(function () {
    colors.enabled = enabled;
  });

  it('string properties', function () {
    expect('x'.red).to.be.equal('\u001b[31mx\u001b[39m');
    expect('x'.underline).to.be.equal('\u001b[4mx\u001b[24m');
    expect('x'.bgBrightCyan).to.be.equal('\u001b[106mx\u001b[49m');
    expect('x'.grey).to.be.equal('x'.gray);
  });

  it('style functions', function () {
    expect(colors.red('x')).to.be.equal('\u001b[31mx\u001b[39m');
    expect(colors.red.bold('x')).to.be.equal('\u001b[31m\u001b[1mx\u001b[22m\u001b[39m');
    expect(colors.green('a', 1)).to.be.equal('\u001b[32ma 1\u001b[39m');
    // a nested style does not end the outer one
    expect(colors.red('a' + colors.blue('b') + 'c')).to.be.equal('\u001b[31ma\u001b[34mb\u001b[31mc\u001b[39m');
    // each line is styled on its own
    expect(colors.red('a\nb')).to.be.equal('\u001b[31ma\u001b[39m\n\u001b[31mb\u001b[39m');
  });

  it('themes', function () {
    printer.themes({
      highlight: ['red', 'underline'],
      note: 'cyan',
    });
    expect('x'.highlight).to.be.equal('\u001b[4m\u001b[31mx\u001b[39m\u001b[24m');
    expect(colors.highlight('x')).to.be.equal('\u001b[4m\u001b[31mx\u001b[39m\u001b[24m');
    expect('x'.note).to.be.equal('\u001b[36mx\u001b[39m');
    expect(colors.note('x')).to.be.equal('\u001b[36mx\u001b[39m');
  });

  it('strip', function () {
    const styled = colors.red.bold('a') + 'b'.green;
    expect(colors.strip(styled)).to.be.equal('ab');
    expect(colors.stripColors(styled)).to.be.equal('ab');
    expect(styled.strip).to.be.equal('ab');
    expect(styled.stripColors).to.be.equal('ab');
  });

  it('maps', function () {
    expect('ab c'.rainbow).to.be.equal('\u001b[31ma\u001b[39m\u001b[33mb\u001b[39m \u001b[34mc\u001b[39m');
    expect('abc'.zebra).to.be.equal('a\u001b[7mb\u001b[27mc');
    expect('ab c'.america).to.be.equal('\u001b[31ma\u001b[39m\u001b[37mb\u001b[39m \u001b[31mc\u001b[39m');
    expect(colors.rainbow('ab c')).to.be.equal('ab c'.rainbow);
  });

  it('random effects', function () {
    ['random', 'trap', 'zalgo'].forEach((name) => {
      expect('text'[name]).to.be.a('string').and.not.equal('');
      expect(colors[name]('text')).to.be.a('string').and.not.equal('');
    });
    expect('some text'.random.strip).to.be.equal('some text');
  });

  it('disable', function () {
    colors.disable();
    expect('x'.red).to.be.equal('x');
    expect('x'.highlight).to.be.equal('x');
    expect(colors.red.bold('x')).to.be.equal('x');
    expect('ab c'.rainbow).to.be.equal('ab c');
    colors.enable();
    expect('x'.red).to.be.equal('\u001b[31mx\u001b[39m');
  });
});

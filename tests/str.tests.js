'use strict';

const path = require('path');
const expect = require('chai').expect;
const {
  _upper_first,
  _lower_first,
  _caml_case,
  _snake_case,
  _render,
  _render_with_file,
  _fixed,
  Emitter
} = require('../src/helper/str');
const { _write, _remove } = require('../src/helper/fs');

describe('str test case', function () {
  it('upper_first', async function () {
    expect(_upper_first(null)).to.be.equal('');
    expect(function () {
      _upper_first(['1']);
    }).to.be.throw('Only supported for string.');
    expect(_upper_first('test')).to.be.equal('Test');
  });
  it('_lower_first', function () {
    expect(_lower_first(null)).to.be.equal('');
    expect(function () {
      _lower_first(['1']);
    }).to.be.throw('Only supported for string.');
    expect(_lower_first('TEST')).to.be.equal('tEST');
  });
  it('_caml_case', function () {
    expect(_caml_case(null)).to.be.equal('');
    expect(function () {
      _caml_case(['1']);
    }).to.be.throw('Only supported for string.');
    expect(_caml_case('a_b_c')).to.be.equal('ABC');
    expect(_caml_case('test_abc')).to.be.eql('TestAbc');
    expect(_caml_case('sls')).to.be.eql('Sls');
    expect(_caml_case('_runtime')).to.be.eql('Runtime');
    expect(_caml_case('tt_123')).to.be.eql('Tt123');
    expect(_caml_case('foo_bar')).to.be.eql('FooBar');

    expect(_caml_case('a_b_c', false)).to.be.equal('aBC');
    expect(_caml_case('test_abc', false)).to.be.eql('testAbc');
    expect(_caml_case('sls', false)).to.be.eql('sls');
    expect(_caml_case('_runtime', false)).to.be.eql('runtime');
    expect(_caml_case('tt_123', false)).to.be.eql('tt123');
    expect(_caml_case('foo_bar', false)).to.be.eql('fooBar');
  });
  it('_snake_case', function () {
    expect(_snake_case(null)).to.be.equal('');
    expect(function () {
      _snake_case(['1']);
    }).to.be.throw('Only supported for string.');
    expect(_snake_case('snakeCaseExampleString')).to.be.equal('snake_case_example_string');
    expect(_snake_case('TestABC')).to.be.eql('test_abc');
    expect(_snake_case('SLS')).to.be.eql('sls');
    expect(_snake_case('_runtime')).to.be.eql('_runtime');
    expect(_snake_case('TT123')).to.be.eql('tt123');
    expect(_snake_case('fooBar')).to.be.eql('foo_bar');
  });
  it('_render', async function () {
    const tmpl = 'My name is ${name}';
    expect(_render(tmpl, { name: 'Leo' })).to.be.equal('My name is Leo');
    const tmpl_file = path.join(__dirname, '../runtime/test-str/test.tmpl');
    try {
      await _render_with_file(tmpl_file, { file: 'test.tmpl' });
    } catch (e) {
      expect(e.message).to.be.equal(`${tmpl_file} not exist.`);
    }
    await _write(tmpl_file, 'render string with ${file}');
    expect(await _render_with_file(tmpl_file, { file: 'test.tmpl' })).to.be.equal('render string with test.tmpl');
    await _remove(path.join(__dirname, '../runtime/test-str/'));
  });
  it('_fixed', function () {
    expect(_fixed(null, 4)).to.be.equal('    ');
    expect(_fixed(null, 4, 'right')).to.be.equal('    ');
    expect(_fixed(null, 4, 'center')).to.be.equal('    ');
  });
  it('emitter', function () {
    const emitter = new Emitter({
      indent: '  ',
      eol: '\n',
      level: 0,
    });
    emitter.emitln('function test(){', 'open');
    emitter.emitln('let a = 0;', true);
    emitter.emitln('let b = a + 10;', 1);
    emitter.emit('console.log', true).emitln('(b)');
    emitter.emitln('}', 'close');
    expect(emitter.output()).to.be.equal('function test(){\n  let a = 0;\n  let b = a + 10;\n  console.log(b)\n}\n');
  });
});

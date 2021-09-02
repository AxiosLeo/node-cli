'use strict';

const path = require('path');
const expect = require('chai').expect;
const {
  _md5,
  _fixed,
  _render,
  _caml_case,
  _snake_case,
  _upper_first,
  _lower_first,
  _render_with_file,
  _equal_ignore_case,
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
    expect(_caml_case(['1'])).to.be.equal('');
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
    expect(_snake_case(['1'])).to.be.equal('');
    expect(_snake_case('snakeCaseExampleString')).to.be.equal('snake_case_example_string');
    expect(_snake_case('TestABC')).to.be.eql('test_abc');
    expect(_snake_case('SLS')).to.be.eql('sls');
    expect(_snake_case('_runtime')).to.be.eql('_runtime');
    expect(_snake_case('TT123')).to.be.eql('tt123');
    expect(_snake_case('fooBar')).to.be.eql('foo_bar');
  });
  it('_render', async function () {
    const tmpl = 'My name is ${name}';
    expect(_render(tmpl)).to.be.equal('My name is ${name}');
    expect(_render(tmpl, { name: 'Leo' })).to.be.equal('My name is Leo');
    const tmpl_file = path.join(__dirname, '../runtime/test-str/test.tmpl');
    try {
      await _render_with_file(tmpl_file, { file: 'test.tmpl' });
    } catch (e) {
      expect(e.message).to.be.equal(`${tmpl_file} not exist.`);
    }
    await _write(tmpl_file, 'render string with ${file}');
    expect(await _render_with_file(tmpl_file)).to.be.equal('render string with ${file}');
    expect(await _render_with_file(tmpl_file, { file: 'test.tmpl' })).to.be.equal('render string with test.tmpl');
    
    await _remove(path.join(__dirname, '../runtime/test-str/'));
  });
  it('_fixed', function () {
    expect(_fixed(null, 4)).to.be.equal('    ');
    expect(_fixed(null, 4, 'right')).to.be.equal('    ');
    expect(_fixed(null, 4, 'center')).to.be.equal('    ');
    expect(_fixed('test')).to.be.equal('test      ');
    expect(_fixed('12345', 6, 'left', '-')).to.be.equal('-12345');
    expect(_fixed('12345', 6, 'right', '-')).to.be.equal('12345-');
  });
  it('emitter', function () {
    let emitter = new Emitter();
    emitter = new Emitter({
      indent: '  ',
      eol: '\n',
      level: 0,
    });
    emitter.emitln('function test(){', 'open');
    emitter.emitln('let a = 0;', true);
    emitter.emitln('let b = a + 10;', 1);
    emitter.emit('console.log', true).emitln('(b);');
    emitter.emitln('if (a !== b) {', 'up');
    emitter.emit('console.log', true).emitln('(a, b);');
    emitter.emitln('}', 'down');
    emitter.emitln('}', 'close');
    emitter.emit().emitln();
    expect(emitter.output()).to.be.equal('function test(){\n  let a = 0;\n  let b = a + 10;\n  console.log(b);\n  if (a !== b) {\n    console.log(a, b);\n  }\n}\n\n');

    expect(emitter.emitIndent()).to.be.equal('');
  });
  it('equal ignore case', function () {
    expect(_equal_ignore_case('a', 'A')).to.be.true;
    // eslint-disable-next-line no-undefined
    expect(_equal_ignore_case(null, undefined)).to.be.true;
  });

  it('md5 computed', function() {
    expect(_md5(null)).to.be.equal('37a6259cc0c1dae299a7866489dff0bd');
    expect(_md5('')).to.be.equal('d41d8cd98f00b204e9800998ecf8427e');
    expect(_md5(0)).to.be.equal('cfcd208495d565ef66e7dff9f98764da');
    expect(_md5(2.11111111111)).to.be.equal('b5d6746f1961db4b9a85fb0b60b2fdf8');
    expect(_md5(true)).to.be.equal('b326b5062b2f0e69046810717534cb09');
    expect(_md5('test')).to.be.equal('098f6bcd4621d373cade4e832627b4f6');
  });
});

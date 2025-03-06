'use strict';

const expect = require('chai').expect;
const Big = require('big.js');
const _number = require('../src/helper/convert')._number;
const { _array2tree, _tree2array } = require('../src/helper/convert');
const { _deep_clone } = require('../src/helper/obj');

const digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';

describe('convert test case', function () {
  it('convert to decimalist', function () {
    expect(_number(9999, 10, 10).str).to.be.equal('9999');
    expect(_number(new Big(9999), 10, 10).str).to.be.equal('9999');
    expect(_number(61, 10, 62).str).to.be.equal('Z');
    expect(_number(61, 10, 62, { digits }).str).to.be.equal('z');
    expect(_number('z', 62, 10).str).to.be.equal('35');
    expect(_number('z', 62, 10, { digits }).str).to.be.equal('DF');
    expect(_number('z', 62, 10, { digits, length: 4 }).str).to.be.equal('AADF');
    expect(_number('ZZZZZZ', 62, 10).str).to.be.equal('56800235583');
  });

  it('throw error', function () {
    expect(() => _number('$', 62, 10)).to.throw('Invalid number character: $');
    expect(() => _number('z', 62, 63)).to.throw('target base must be less than 62');
  });

  it('array2tree', function () {
    const data = [
      { id: 1, parent_id: 0 },
      { id: 2, parent_id: 3 },
      { id: 3, parent_id: 1 },
      { id: 4, parent_id: 2 },
      { id: 5, parent_id: 6 },
      { id: 6, parent_id: 7 },
      { id: 7, parent_id: 5 }
    ];
    const res = _array2tree(data, { parent_index: 'parent_id', data_index: 'id', child_name: 'child' });
    expect(res.length).to.be.equal(1);
    expect(res[0].id).to.be.equal(1);
    expect(res[0].child.length).to.be.equal(1);
    expect(res[0].child[0].id).to.be.equal(3);
    expect(res[0].child[0].child.length).to.be.equal(1);
    expect(res[0].child[0].child[0].id).to.be.equal(2);
    expect(res[0].child[0].child[0].child.length).to.be.equal(1);
    expect(res[0].child[0].child[0].child[0].id).to.be.equal(4);
    expect(res[0].child[0].child[0].child[0].child.length).to.be.equal(0);
    expect(res[0].child[0].child[0].child[0].parent_id).to.be.equal(2);

    // throw error when data is not array
    expect(() => _array2tree(null)).to.throw('data must be an array');
    expect(() => _array2tree([{ id: 1 }])).to.throw('data must have "parent_id" and "id"');
  });

  it('tree2array', function () {
    const data = [
      {
        'id': 1,
        'parent_id': 0,
        'child': [
          {
            'id': 3,
            'parent_id': 1,
            'child': [
              {
                'id': 2,
                'parent_id': 3,
                'child': [
                  {
                    'id': 4,
                    'parent_id': 2,
                    'child': ''
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
    let res = _tree2array(data, { parent_index: 'parent_id', data_index: 'id', child_name: 'child' });
    expect(JSON.stringify(_array2tree(res))).to.equal(JSON.stringify(data));

    const data2 = _deep_clone(data);
    delete data2[0].parent_id;
    delete data2[0].child[0].parent_id;
    delete data2[0].child[0].child[0].parent_id;
    res = _tree2array(data2[0]);
    expect(JSON.stringify(_array2tree(res))).to.equal(JSON.stringify(data));
  });
});

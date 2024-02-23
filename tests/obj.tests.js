'use strict';

const expect = require('chai').expect;
const { Configuration } = require('..');
const { _deep_clone, _flatten, _unflatten } = require('../src/helper/obj');
const { _array2tree, _tree2array } = require('../src/helper/convert');

describe('obj test case', function () {
  it('flatten', function () {
    const res = _flatten([1, 2, 3, { a: 'A' }, { b: 'B' }]);
    expect(JSON.stringify(res)).to.equal('{"0":1,"1":2,"2":3,"3.a":"A","4.b":"B"}');

    const bak = _unflatten(res);
    expect(JSON.stringify(bak)).to.equal('[1,2,3,{"a":"A"},{"b":"B"}]');

    const obj = { '': 1, '1': 2, '3.a': 'A', '4.b': 'B' };
    expect(JSON.stringify(_unflatten(obj))).to.equal('{"1":2,"3":{"a":"A"},"4":{"b":"B"},"":1}');
  });

  it('assign test case', function () {
    const config = new Configuration();
    config.assign({
      a: {
        b: {
          c: [
            { x: [0, 1, 2] }
          ]
        }
      }
    });
    expect(config.get('a.b.c.0.x.0')).to.be.equal(0);
    config.assign({
      a: {
        b: {}
      },
      z: 'Z'
    });
    expect(config.get('a.b.c.0.x.0')).to.be.equal(0);
    expect(config.get('z')).to.be.equal('Z');
    config.assign({ a: 'A' });
    expect(config.get('a')).to.be.equal('A');
  });

  it('deep clone', function () {
    const obj = {
      a: 'b'
    };
    let clone = obj;
    clone.a = 'A';
    expect(obj.a).to.be.equal('A');
    clone = _deep_clone(obj);
    clone.a = 'string';
    expect(obj.a).to.be.equal('A');

    const complexObj = {
      a: {
        b: {
          c: {
            d: [{ x: '1' }]
          }
        }
      }
    };
    clone = _deep_clone(complexObj);
    clone.a.b.c.d.push({ y: 2 });
    clone.a.b.c.d[0].x = '3';
    expect(complexObj.a.b.c.d.length).to.be.equal(1);
    expect(complexObj.a.b.c.d[0].x).to.be.equal('1');
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
    expect(() => _array2tree([{ id: 1, parent_id: 0, child: [] }])).to.throw('child name "child" is reserved for child data, please use another name');
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
                    'child': []
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

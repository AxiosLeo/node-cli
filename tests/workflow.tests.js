'use strict';

const expect = require('chai').expect;
const Workflow = require('../src/workflow');

describe('workflow test case', () => {
  it('throw error on first step', async () => {
    const operator = {
      a: async () => {
        throw new Error('throw error');
      },
      b: async () => { }
    };
    let workflow = new Workflow(operator);
    let context = {};
    workflow.start(context).then(() => {
      // not to be here
      expect(true).to.be.false;
    }).catch((context) => {
      expect(context.success).to.be.false;
    });

    workflow = new Workflow(operator, ['b', 'a']);
    context = {};
    workflow.start(context).then(() => {
      // not to be here
      expect(true).to.be.false;
    }).catch((context) => {
      expect(context.success).to.be.false;
      expect(Object.keys(context.step_data).join(',')).to.be.equal('b,a');
    });
  });

  it('invalid operator or context', async () => {
    let workflow;
    try {
      workflow = new Workflow();
    } catch (e) {
      expect(e.message).to.be.equal('Invalid workflow_operator.');
    }
    const operator = {
      a: async () => { },
      b: async () => { }
    };
    workflow = new Workflow(operator);
    try {
      await workflow.start();
    } catch (e) {
      expect(e.message).to.be.equal('Invalid context.');
    }
  });

  it('invalid context.workflows', async () => {
    const context = {};
    try {
      const workflow = new Workflow({});
      await workflow.start(context);
    } catch (e) {
      expect(e.message).to.be.equal('context.workflows cannot be empty.');
    }
  });

  it('throw error in reject', async () => {
    const operator = {
      a: async () => { },
      b: async () => { }
    };
    const workflow = new Workflow(operator);
    const context = {};
    const error_handler = () => {
      throw new Error('throw error in reject');
    };
    workflow.start(context).then(() => { }).catch(error_handler).catch((e) => {
      expect(e.message).to.be.equal('throw error in reject');
    });
  });

  it('skip workflow step', async () => {
    const operator = {
      a: async () => {
        // will be executed step 'c'.
        return 'c';
      },
      b: async () => { },
      c: async () => { },
    };
    let workflow = new Workflow(operator);
    const context = {};
    await workflow.start(context);
    expect(context.success).to.be.true;
    expect(context.step_data).to.include.all.keys('a', 'c');
    expect(context.step_data).to.not.include.all.keys('b');

    workflow = new Workflow(operator);
  });

  it('reset workflows', async () => {
    const operator = {
      a: async () => { },
      b: async () => { },
      c: async () => { },
    };
    let workflow = new Workflow(operator, ['c', 'b']);
    const context = {};
    await workflow.start(context);
    expect(context.success).to.be.true;
    expect(context.step_data).to.include.all.keys('b', 'c');
    expect(context.step_data).to.not.include.all.keys('a');
    expect(workflow.workflows[0]).to.be.equal('c');
  });
});

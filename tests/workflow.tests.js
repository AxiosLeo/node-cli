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
    const workflow = new Workflow(operator);
    const context = {
      workflows: ['a', 'b']
    };
    workflow.start(context).then(() => {
      // not to be here
      expect(true).to.be.false;
    }).catch((context) => {
      expect(context.success).to.be.false;
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
    const operator = {
      a: async () => { },
      b: async () => { }
    };
    const workflow = new Workflow(operator);
    const context = {
      workflows: 'string is invalid'
    };
    try {
      await workflow.start(context);
    } catch (e) {
      expect(e.message).to.be.equal('context.workflows should be Array.');
    }
    try {
      context.workflows = [];
      await workflow.start(context);
    } catch (e) {
      expect(e.message).to.be.equal('context.workflows cannot be empty.');
    }
  });
  it('use a non-existent workflow name', async () => {
    const operator = {
      a: async () => { },
      b: async () => { }
    };
    const workflow = new Workflow(operator);
    const context = {
      workflows: ['a', 'b', 'c', 'd', 'e']
    };
    try {
      await workflow.start(context);
    } catch (e) {
      expect(e.success).to.be.false;
      expect(e.curr.error.message).to.be.equal('Unimplemented c() method in operator.');
    }
  });
  it('throw error in reject', async () => {
    const operator = {
      a: async () => { },
      b: async () => { }
    };
    const workflow = new Workflow(operator);
    const context = {
      workflows: ['a', 'b', 'c', 'd', 'e']
    };
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
    const workflow = new Workflow(operator);
    const context = {
      workflows: ['a', 'b', 'e', 'f', 'c']
    };
    await workflow.start(context);
    expect(context.success).to.be.true;
    expect(context.step_data).to.include.all.keys('a', 'c');
    expect(context.step_data).to.not.include.all.keys('b', 'e', 'f');
  });
});

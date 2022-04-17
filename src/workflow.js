'use strict';

const moment = require('moment');
const debug = require('./debug');

function next(workflows, curr) {
  const index = workflows.indexOf(curr);
  if (index + 1 >= workflows.length) {
    return null;
  }
  return workflows[index + 1];
}

class Workflow {
  constructor(operator, workflows = []) {
    if (!operator) {
      debug.stack('Invalid workflow_operator.');
    }
    this.operator = operator;
    if (workflows && workflows.length) {
      this.workflows = workflows;
    } else {
      this.workflows = Object.keys(operator);
    }
    if (!this.workflows.length) {
      debug.stack('context.workflows cannot be empty.');
    }
  }

  async dispatch(context, curr) {
    const operator = this.operator;
    context.curr = {
      workflow: curr,
      start: moment().valueOf(),
      end: null,
      success: null,
      error: null
    };
    let res = await operator[curr].call(this, context);
    context.curr.success = true;
    context.curr.end = moment().valueOf();
    if (!context.step_data) {
      context.step_data = {};
    }
    context.step_data[curr] = context.curr;
    if (typeof res === 'string' && this.workflows.indexOf(res) > -1) {
      await this.dispatch(context, res);
    } else {
      curr = next(this.workflows, curr);
      if (curr) {
        await this.dispatch(context, curr);
      }
    }
  }

  async start(context) {
    return new Promise((resolve, reject) => {
      if (!context) {
        debug.stack('Invalid context.');
      }
      context.success = null;
      context.step_data = {};
      this.dispatch(context, this.workflows[0]).then(() => {
        context.curr = {};
        context.success = true;
        resolve(context);
      }).catch((e) => {
        context.success = false;
        context.curr.success = false;
        context.curr.error = e;
        context.curr.end = moment().valueOf();
        context.step_data[context.curr.workflow] = context.curr;
        reject(context);
      });
    });
  }
}

module.exports = Workflow;

'use strict';

const moment = require('moment');
const debug = require('./debug');

function next(context, curr) {
  if (context.workflows.indexOf(curr) < -1) {
    debug.stack(`Unsupported workflow : ${curr}`);
  }
  const index = context.workflows.indexOf(curr);
  if (index + 1 >= context.workflows.length) {
    return null;
  }
  return context.workflows[index + 1];
}

class Workflow {
  constructor(workflow_operator) {
    if (!workflow_operator) {
      debug.stack('Invalid parameter: workflow_operator cannot be null.');
    }
    this.operator = workflow_operator;
  }

  async wrong(context, e) {
    context.success = false;
    context.curr = {
      workflow: 'error',
      error_step: context.curr.workflow,
      start: moment().valueOf(),
      end: null,
      error: e
    };
    try {
      await this.error_handler(context, 12);
    } catch (e) {
      context.curr.error = e;
    }
    context.curr.end = moment().valueOf();
  }

  async dispatch(context, curr) {
    const operator = this.operator;
    if (typeof operator[curr] === 'undefined') {
      debug.stack(`Unimplemented ${curr}() method in operator.`);
    }
    context.curr = {
      workflow: curr,
      start: moment().valueOf(),
      end: null,
      success: null
    };
    let res = null;
    try {
      res = await operator[curr].call(this, context);
      context.curr.success = true;
    } catch (e) {
      context.curr.success = false;
      context.curr.error = e;
    }
    context.curr.end = moment().valueOf();
    context.step_data[curr] = context.curr;
    if (!context.curr.success) {
      await this.wrong(context, context.curr.error);
    } else if (typeof res === 'string' && context.workflows.indexOf(res) > -1) {
      await this.dispatch(context, res);
    } else {
      curr = next(context, curr);
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
      if (!Array.isArray(context.workflows)) {
        debug.stack('context.workflows should be Array.');
      }
      if (!context.workflows.length) {
        debug.stack('context.workflows cannot be empty.');
      }
      this.error_handler = reject;
      context.success = null;
      context.curr = {};
      context.step_data = {};
      this.dispatch(context, context.workflows[0]).then(() => {
        context.curr = {};
        context.success = true;
        resolve(context);
      }).catch((e) => {
        context.curr = {};
        this.wrong(context, e);
      });
    });
  }
}

module.exports = Workflow;
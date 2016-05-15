const assert = require('chai').assert;
const cli = require("../");
const TaskTypes = require("../dist/task.resolve").TaskTypes;
const TaskRunModes = require("../dist/task.resolve").TaskRunModes;
const SequenceItemTypes = require("../dist/task.sequence.factories").SequenceItemTypes;

describe.skip('task.resolve object literal', function () {
    it('with inline functions', function () {
        const runner = cli.getRunner(['js'], {
            tasks: {
                js: {
                    taskName: '@sh ls'
                }
            }
        });
        assert.equal(runner.tasks.valid[0].runMode, TaskRunModes.series);
    });
});
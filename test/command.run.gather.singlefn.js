const assert = require('chai').assert;
const cli = require('../');

describe('Gathering run tasks with single fn export', function () {
    it('can handle single fn', function () {
    	const runner = cli.getRunner(['test/fixtures/tasks/single-export.js']);
        assert.equal(runner.sequence[0].sequenceTasks.length, 1);
        assert.equal(runner.sequence[0].task.taskName, 'test/fixtures/tasks/single-export.js');
    });
});

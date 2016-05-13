const assert = require('chai').assert;
const cb  = require('../dist/index')['default'];
const TaskTypes  = require('../dist/task.resolve').TaskTypes;

describe('Using a cbfile', function () {
    it('works with inline functions', function () {
    	const runner = cb({
            input: ['shane'],
            flags: {
                handoff: true,
                cbfile: 'test/fixtures/cbfile.js'
            }
        });
        assert.equal(runner.tasks.valid.length, 1);
        assert.equal(runner.tasks.valid[0].tasks.length, 2);
        assert.equal(runner.tasks.valid[0].tasks[0].rawInput, 'kittie');
        assert.equal(runner.tasks.valid[0].tasks[0].type, TaskTypes.InlineFunction);
        assert.equal(runner.tasks.valid[0].tasks[1].type, TaskTypes.InlineFunction);
    });
    it('works with options', function () {
        const runner = cb({
            input: ['kittie:dev'],
            flags: {
                handoff: true,
                cbfile: 'test/fixtures/cbfile.js'
            }
        });
        assert.equal(runner.sequence[0].options.input, 'some/file.js');
    });
});
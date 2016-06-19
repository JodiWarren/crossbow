const assert = require('chai').assert;
const parse = require("../dist/cli.parse").default;

describe.only('cli parser', function () {
    it('handles simple command + 2 inputs', function () {
        const input = 'run task-1 task2';
        const output = parse(input);
        assert.deepEqual(output.command, 'run');
        assert.deepEqual(output.input, ['task-1', 'task2']);
    });
    it('handles simple command + input + flag', function () {
        const input = 'run task-1 -v';
        const output = parse(input);
        assert.deepEqual(output.command, 'run');
        assert.deepEqual(output.input, ['task-1']);
        assert.deepEqual(output.flagValues.v.values[0], true);
    });
    it('multiple boolean flags', function () {
        const input = 'run task-1 -vsq';
        const output = parse(input);
        assert.deepEqual(output.command, 'run');
        assert.deepEqual(output.input, ['task-1']);
        assert.deepEqual(output.flagValues.v.values[0], true);
        assert.deepEqual(output.flagValues.s.values[0], true);
        assert.deepEqual(output.flagValues.q.values[0], true);
    });
    it('setters', function () {
        const input = 'run task-1 --name=shane -c example.js -ab --log';
        const output = parse(input);
        assert.deepEqual(output.command, 'run');
        assert.deepEqual(output.input, ['task-1']);
        assert.deepEqual(output.flagValues.name.values[0], 'shane');
        assert.deepEqual(output.flagValues.c.values[0], 'example.js');
        assert.deepEqual(output.flagValues.a.values[0], true);
        assert.deepEqual(output.flagValues.b.values[0], true);
        assert.deepEqual(output.flagValues.log.values[0], true);
    });
    it('adds input after cut off', function () {
        const input = 'run task-1 -p 8080 -- task2 task3';
        const output = parse(input);
        assert.deepEqual(output.command, 'run');
        assert.deepEqual(output.input, ['task-1', 'task2', 'task3']);
        assert.deepEqual(output.flagValues.p.values[0], '8080');
    });
    it('Works with alias in opts', function () {
        const input = 'run task-1 -p 8080';
        const output = parse(input, {
            port: {
                alias: 'p'
            }
        });
        assert.deepEqual(output.flagValues.port.values[0], '8080');
    });
    it('Works with multiple values (-vvv) etc', function () {
        const input = 'run task-1 -vvv';
        const output = parse(input, {
            verbose: {
                alias: 'v'
            }
        });
        assert.deepEqual(output.flagValues.verbose.values[0], true);
        assert.deepEqual(output.flagValues.verbose.values[1], true);
        assert.deepEqual(output.flagValues.verbose.values[2], true);
    });
    it('handle multi input + multi mixed flags', function () {
        const input = 'run task1 task2 -p 8000 -q -vvv -name=kittie -b task3 task4 --server ./app ./tmp';
        const output = parse(input, {
            'port': {
                alias: 'p',
                type: 'number'
            },
            "server": {
                alias: 's',
                type: 'string'
            },
            "before": {
                alias: 'b',
                type: 'array'
            }
        });
        assert.deepEqual(output.input, ['task1', 'task2']);
        assert.deepEqual(output.flagValues.port.values[0], '8000'); // -p 8000
        assert.deepEqual(output.flagValues.v.values[0], true); // -vvv
        assert.deepEqual(output.flagValues.v.values[1], true); // -vvv
        assert.deepEqual(output.flagValues.v.values[2], true); // -vvv
        assert.deepEqual(output.flagValues.name.values[0], 'kittie');  // -name=kittie
        assert.deepEqual(output.flagValues.before.values[0], 'task3'); // -b task3 task4
        assert.deepEqual(output.flagValues.before.values[1], 'task4'); // -b task3 task4
        assert.deepEqual(output.flagValues.server.values[0], './app'); // --server ./app ./tmp
        assert.deepEqual(output.flagValues.server.values[1], './tmp'); // --server ./app ./tmp
    });
});

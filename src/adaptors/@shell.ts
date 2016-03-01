import {RunCommandTrigger} from "../command.run";
import {getArgs, runCommand} from './@npm';
import {Task} from "../task.resolve";
const debug = require('debug')('cb:@shell');

module.exports = function (task: Task, trigger: RunCommandTrigger) {

    return function (opts, ctx, observer) {

        const args = getArgs(task, trigger);

        debug(`running %s`, args.cmd);

        const emitter = runCommand(args.cmd, {
            cwd: trigger.config.cwd,
            env: process.env,
            stdio: [0, 1, 2]
        });

        emitter.on('close', function (code) {
            if (trigger.config.exitOnError) {
                if (code !== 0) {
                    const e = new Error(`Command ${args.cmd.join(' ')} failed with exit code ${code}`);
                    return observer.onError(e);
                }
            }
            observer.done();
        }).on('error', function (err) {
            observer.onError(err);
        });
    };
};
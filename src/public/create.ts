import {CommandTrigger} from "../command.run";
import {CBWatchOptions} from "../watch.resolve";
import {handleIncomingWatchCommand} from "../command.watch";
import {CrossbowConfiguration} from "../config";
import {getRawOutputStream} from "../watch.file-watcher";
import {defaultWatchOptions} from "../watch.resolve";
const merge = require('lodash.merge');

type returnFn = (opts: {}, trigger: CommandTrigger) => any;

let fncount = 0;
let inlineWatcherCount = 0;

function incomingTask (taskname: string, fn: returnFn): {}
function incomingTask (taskname: string, deps: string[], fn?: returnFn): {}
function incomingTask (taskname: string, deps?, fn?): {} {

    if (typeof deps === 'function') {
        fn = deps;
        deps = [];
    }

    const outgoing = {};

    if (deps.length) {
        if (!fn) {
            outgoing[taskname] = deps;
        } else {
            const fnname = `_internal_fn_${fncount}_${taskname}`;
            outgoing[fnname] = fn;
            outgoing[taskname] = deps.concat(fnname);
        }
    } else {
        if (fn) {
            outgoing[taskname] = fn;
        }
    }
    return outgoing;
}

var input = {
    tasks: {},
    watch: {},
    options: {},
    config: <CrossbowConfiguration>{}, // to be set by lib
    cli: {}, // to be set by lib
};

function incomingOptions (taskname: string, hash?:any): {} {
    const outgoing = {};
    if (typeof taskname === 'string') {
        outgoing[taskname] = hash;
        return outgoing;
    }
    return taskname;
}

export const api = {
    input: input,
    task: function (taskname: string) {
        const res = incomingTask.apply(null, arguments);
        input.tasks = merge(input.tasks, res);
        return {
            options: function (hash: any) {
                const res = incomingOptions(taskname, hash);
                input.options = merge(input.options, res);
            }
        }
    },
    options: function (incoming: {}) {
        const res = incomingOptions.apply(null, arguments);
        input.options = merge(input.options, res);
    },
    watch: function (patterns: string[], tasks: string[], options?: CBWatchOptions) {
        const identifer = `_inline_watcher_${inlineWatcherCount++}`;
        input.watch[identifer] = {
            options: options,
            watchers: [
                {
                    patterns: patterns,
                    tasks: tasks
                }
            ]
        };
        const cliInput = ['watch', identifer];
        const output   = handleIncomingWatchCommand({input: cliInput, flags:{}}, input, input.config);

        return output.pluck('watchEvent');
    },
    watcher: function (patterns: string[], options: CBWatchOptions) {
        const num = inlineWatcherCount++;
        const identifer = `_inline_watcher_${num}`;
        const watcher = {
            patterns: patterns,
            tasks: [],
            name: identifer,
            options: merge({}, defaultWatchOptions, options),
            watcherUID: num
        };
        return getRawOutputStream(watcher);
    }
};

export default input;

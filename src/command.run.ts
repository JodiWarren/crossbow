/// <reference path="../typings/main.d.ts" />import Rx = require('rx');import {CLI, CrossbowInput, CrossbowReporter} from './index';import {CrossbowConfiguration} from './config';import {ReportNames} from "./reporter.resolve";import {TaskRunModes, resolveTasks, maybeTaskNames} from './task.resolve';import {SequenceItem} from './task.sequence.factories';import {Tasks} from './task.resolve';import {Runner} from './task.runner';import Immutable = require('immutable');import * as seq from "./task.sequence";import promptForRunCommand from './command.run.interactive';import executeRunCommand from "./command.run.execute";const debug = require('debug')('cb:command.run');const merge = require('../lodash.custom').merge;export interface CommandTrigger {    type: TriggerTypes    cli: CLI    input: CrossbowInput    config: CrossbowConfiguration    tracker?: any    tracker$?: any    shared?: Rx.BehaviorSubject<Immutable.Map<string, any>>,    reporter: CrossbowReporter}export enum TriggerTypes {    command = <any>"command",    watcher = <any>"watcher",}export function getRunCommandSetup (trigger: CommandTrigger) {    const cliInput = trigger.cli.input.slice(1);    /**     * Task Tracker for external observers     * @type {Subject<T>}     */    trigger.tracker = new Rx.Subject();    trigger.tracker$ = trigger.tracker.share();    /**     * First Resolve the task names given in input.     */    const tasks = resolveTasks(cliInput, trigger);    const topLevelParallel = tasks.all.some(function (task) {        return task.runMode === TaskRunModes.parallel;    });    /**     * If only 1 task is being run, check if any sub-tasks     * are trying to be run in parallel mode and if so, set the runMode     * This is done to ensure if a child errors, it doesn't affect children.     * (as it's only a single task via the cli, it wouldn't be expected)     */    if (cliInput.length === 1 && topLevelParallel) {        trigger.config.runMode = TaskRunModes.parallel;    }    /**     * All this point, all given task names have been resolved     * to either modules on disk, or @adaptor tasks, so we can     * go ahead and create a flattened run-sequence     */    const sequence = seq.createFlattenedSequence(tasks.valid, trigger);    /**     * With the flattened sequence, we can create nested collections     * of Rx Observables     */    const runner = seq.createRunner(sequence, trigger);    /**     * Check if the user intends to handle running the tasks themselves,     * if thats the case we give them the resolved tasks along with     * the sequence and the primed runner     */    return {tasks, sequence, runner};}export default function handleIncomingRunCommand(cli: CLI, input: CrossbowInput, config: CrossbowConfiguration, reporter: CrossbowReporter):any {    /**     * Array of top-level task names that are available     */    const topLevelTasks = Object.keys(input.tasks);    /**     * The shared Map that tasks can read/write to     */    const sharedMap     = new Rx.BehaviorSubject(Immutable.Map({}));    const type = TriggerTypes.command;    debug('top level tasks available', topLevelTasks);    if (config.handoff) {        return getRunCommandSetup({            shared: sharedMap,            cli,            input,            config,            reporter,            type        });    }    /**     * If the interactive flag was given (-i), always try     * that first.     */    if (config.interactive) {        return enterInteractive();    }    /**     * If the user never provided a task then we either look     * for a `default` task or enter interactive mode if possible     * eg:     *  $ crossbow run     */    if (cli.input.length === 1) {        /**         * First look if there's a 'default' task defined         */        if (hasDefaultTask()) {            const cliMerged = merge({}, cli, {input: ['run', 'default']});            return executeRunCommand({                shared: sharedMap,                cli: cliMerged,                input,                config,                reporter,                type: TriggerTypes.command            });        }        /**         * If no default task was found above, enter interactive mode         */        return enterInteractive();    }    /**     * Check if the provided input contains either     * 'default' or 'default@p' etc     */    function hasDefaultTask () {        if (maybeTaskNames(input.tasks, 'default').length) {            return true;        }        if (input.tasks['default'] !== undefined) {            return true;        }    }    /**     * If no task given, or if user has selected interactive mode,     * show the UI for task selection     */    function enterInteractive() {        if (!topLevelTasks.length) {            reporter({type: ReportNames.NoTasksAvailable});            return;        }        reporter({type: ReportNames.NoTasksProvided});        return promptForRunCommand(cli, input, config, reporter).subscribe(function (answers) {            const cliMerged = merge({}, cli, {input: ['run', ...answers.tasks]});            const configMerged = merge({}, config, {runMode: TaskRunModes.parallel});            return executeRunCommand({                shared: sharedMap,                cli: cliMerged,                input,                reporter,                config: configMerged,                type            });        });    }    /**     * If we reach here we're dealing with the default case     * where we are simply executing the command as normal     * eg:     *  $ crossbow run task1 task2@p etc ...     */    return executeRunCommand({        shared: sharedMap,        cli,        input,        config,        reporter,        type    });}
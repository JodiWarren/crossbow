import {CrossbowConfiguration} from "./config";
import {CrossbowInput, CLI} from "./index";
import {readFilesFromDisk, ExternalFile, ExternalFileInput, ExternalFileContent, HashDirErrorTypes} from "./file.utils";
import {TaskReport} from "./task.runner";
import {CommandTrigger} from "./command.run";
import {SequenceItem} from "./task.sequence.factories";
import {InitConfigFileExistsError, InitConfigFileTypeNotSupported} from "./command.init";
import {ParsedPath} from "path";
import {Task, TaskCollection} from "./task.resolve";
import {WatchTask, Watcher, WatchTasks} from "./watch.resolve";
import {WatchRunners} from "./watch.runner";
import {DocsInputFileNotFoundError, DocsOutputFileExistsError} from "./command.docs";
import Rx = require('rx');
import logger from './logger';

export interface Reporter {
    errors: {}[]
    type: ReporterTypes
    callable?: Function
    sources: ExternalFile[]
}

export enum ReporterErrorTypes {
    ReporterFileNotFound = <any>"ReporterFileNotfound",
    ReporterTypeNotSupported = <any>"ReporterTypeNotSupported"
}
export interface ReporterError {type: ReporterErrorTypes, file?: ExternalFile}
export interface ReporterFileNotFoundError extends ReporterError {}
export interface ReporterTypeNotSupportedError extends ReporterError {}
export enum ReporterTypes {
    InlineFunction   = <any>"InlineFunction",
    ExternalFile     = <any>"ExternalFile",
    UnsupportedValue = <any>"UnsupportedValue",
    Muted            = <any>"Muted"
}

export interface Reporters {
    all: Reporter[]
    valid: Reporter[]
    invalid: Reporter[]
}

export enum ReportTypes {
    DuplicateInputFile             = <any>"DuplicateInputFile",
    InputFileCreated               = <any>"InputFileCreated",
    InitInputFileTypeNotSupported  = <any>"InitInputFileTypeNotSupported",
    InputError                     = <any>"InputFileNotFound",
    InputFileNotFound              = <any>"InputFileNotFound",
    InvalidReporter                = <any>"InvalidReporter",
    UsingInputFile                 = <any>"UsingInputFile",

    TaskList                       = <any>"TaskList",
    TaskTree                       = <any>"TaskTree",
    TaskErrors                     = <any>"TaskErrors",
    TaskReport                     = <any>"TaskReport",

    NoTasksAvailable               = <any>"NoTasksAvailable",
    NoTasksProvided                = <any>"NoTasksProvided",

    SimpleTaskList                 = <any>"SimpleTaskList",
    BeforeWatchTaskErrors          = <any>"BeforeWatchTaskErrors",
    BeforeTaskList                 = <any>"BeforeTaskList",
    BeforeTasksDidNotComplete      = <any>"BeforeTasksDidNotComplete",
    WatchTaskTasksErrors           = <any>"WatchTaskTasksErrors",
    WatchTaskErrors                = <any>"WatchTaskErrors",
    WatchTaskReport                = <any>"WatchTaskReport",
    NoFilesMatched                 = <any>"NoFilesMatched",
    NoWatchersAvailable            = <any>"NoWatchersAvailable",
    NoWatchTasksProvided           = <any>"NoWatchTasksProvided",
    Watchers                       = <any>"Watchers",
    WatcherNames                   = <any>"WatcherNames",
    WatcherTriggeredTasksCompleted = <any>"WatcherTriggeredTasksCompleted",
    WatcherTriggeredTasks          = <any>"WatcherTriggeredTasks",

    DocsAddedToFile                = <any>"DocsAddedToFile",
    DocsGenerated                  = <any>"DocsMarkdownGenerated",
    DocsInputFileNotFound          = <any>"DocsInputFileNotFound",
    DocsOutputFileExists           = <any>"DocsOutputFileExists",
    DocsInvalidTasksSimple         = <any>"DocsInvalidTasksSimple",

    Summary                        = <any>"Summary",
    HashDirError                   = <any>"HashDirError",
}

export interface IncomingReport {
    type: ReportTypes
    data?: any
}

export interface OutgoingReport {
    origin: ReportTypes
    data: string[]
}

export interface UsingConfigFileReport extends IncomingReport {
    data: {sources: ExternalFileInput[]}
}
export interface InputFileNotFoundReport extends IncomingReport {
    data: {sources: ExternalFileInput[]}
}
export interface TaskReportReport {
    data: {report: TaskReport,trigger: CommandTrigger}
}
export interface SummaryReport extends IncomingReport {
    data: {
        sequence: SequenceItem[],
        cli: CLI,
        title: string,
        config: CrossbowConfiguration,
        runtime: number,
        errors: TaskReport[]
    }
}
export interface TaskListReport extends IncomingReport {
    data: {sequence: SequenceItem[],cli: CLI,titlePrefix: string,config: CrossbowConfiguration}
}
export interface SimpleTaskListReport extends IncomingReport {
    data: {lines: string[]}
}
export interface InvalidReporterReport extends IncomingReport {
    data: {reporters: Reporters}
}
export interface DuplicateConfigFile extends IncomingReport {
    data: {error: InitConfigFileExistsError}
}
export interface ConfigFileCreatedReport extends IncomingReport {
    data: {parsed: ParsedPath}
}
export interface InitInputFileTypeNotSupportedReport extends IncomingReport {
    data: {error: InitConfigFileTypeNotSupported}
}
export interface TaskTreeReport extends IncomingReport {
    data: {tasks: Task[], config: CrossbowConfiguration, title: string}
}
export interface TaskErrorsReport extends IncomingReport {
    data: {tasks: Task[], taskCollection: TaskCollection, input: CrossbowInput, config: CrossbowConfiguration}
}
export interface WatchersReport extends IncomingReport {
    data: {watchTasks: WatchTask[]}
}
export interface BeforeWatchTaskErrorsReport extends IncomingReport {
    data: {watchTasks: WatchTasks, trigger: CommandTrigger}
}
export interface BeforeTaskListReport extends IncomingReport {
    data: {sequence: SequenceItem[], cli: CLI, config: CrossbowConfiguration}
}
export interface BeforeTasksDidNotCompleteReport extends IncomingReport {
    data: {error: Error}
}
export interface WatchTaskTasksErrorsReport extends IncomingReport {
    data: {tasks: Task[], runner: Watcher, config: CrossbowConfiguration}
}
export interface WatchTaskErrorsReport extends IncomingReport {
    data: {watchTasks: WatchTask[]}
}
export interface WatchTaskReportReport extends IncomingReport {
    data: {report: TaskReport, trigger: CommandTrigger}
}
export interface WatcherTriggeredTasksReport extends IncomingReport {
    data: {index: number, taskCollection: TaskCollection}
}
export interface WatcherTriggeredTasksCompletedReport extends IncomingReport {
    data: {index: number, taskCollection: TaskCollection, time: number}
}
export interface WatcherNamesReport extends IncomingReport {
    data: {runners: WatchRunners, trigger: CommandTrigger}
}
export interface NoFilesMatchedReport extends IncomingReport {
    data: {watcher: Watcher}
}
export interface DocsInputFileNotFoundReport extends IncomingReport {
    data: {error: DocsInputFileNotFoundError}
}
export interface DocsAddedToFileReport extends IncomingReport {
    data: {file: ExternalFileContent}
}
export interface DocsOutputFileExistsReport extends IncomingReport {
    data: {error: DocsOutputFileExistsError}
}
export interface HashError extends Error {
    type: HashDirErrorTypes
}
export interface HashDirErrorReport extends IncomingReport {
    data: {error: HashError, cwd: string}
}

export function getReporters (config: CrossbowConfiguration, input: CrossbowInput): Reporters {

    const reporters = (function () {
        /**
         * If --outputOnly (-q) was given, the user wants NO
         * output, other than output from child processes - this
         * is used for shell expansion within other tasks where
         * the 'using crossbow.yaml' or completions summaries are
         * unwanted.
         */
        if (config.outputOnly) {
            return [{
                type: ReporterTypes.Muted,
                callable: () => { /* no op */ },
                errors: [],
                sources: []
            }]
        }
        /**
         * At this point, a user may of provided a string (as a path to lookup)
         * or a function directly, so we use those to resolve the reporters.
         */
        return [].concat(config.reporters).map(getOneReporter);
    })();

    return {
        all: reporters,
        valid: reporters.filter(x => x.errors.length === 0),
        invalid: reporters.filter(x => x.errors.length > 0)
    };

    function getOneReporter(reporter): Reporter {

        /**
         * If a function was given as a reported (eg: inline)
         * then it's ALWAYS a valid reporter
         */
        if (typeof reporter === 'function') {
            return {
                type: ReporterTypes.InlineFunction,
                callable: reporter,
                errors: [],
                sources: []
            }
        }
        /**
         * If the reporter was not a string or function
         * it's definitely an unsupported type
         */
        if (typeof reporter !== 'string') {
            return {
                type: ReporterTypes.UnsupportedValue,
                errors: [{type: ReporterErrorTypes.ReporterTypeNotSupported}],
                sources: [reporter]
            }
        }

        const files = readFilesFromDisk([reporter], config.cwd);
        const errors = files
            .reduce((acc, item) => {
                // Convert errors from reading files
                // into errors about reporters
                // This is for correct context in logging
                if (item.errors.length) {
                    return acc.concat({
                        type: ReporterErrorTypes.ReporterFileNotFound,
                        file: item
                    })
                }
                return acc;
            }, []);

        /**
         * If any errors occurred, return them
         */
        if (errors.length) {
            return {
                type: ReporterTypes.ExternalFile,
                errors: errors,
                sources: files
            }
        }

        /**
         * Now try to 'require' the module. If it
         * does not contain a default export, create an error
         */
        const callable = require(files[0].resolved);
        if (typeof callable !== "function") {
            return {
                type: ReporterTypes.UnsupportedValue,
                errors: [{type: ReporterErrorTypes.ReporterTypeNotSupported}],
                sources: [files[0]]
            }
        }

        /**
         * Here we have a valid external file to return
         * as a single reporter
         */
        return {
            type: ReporterTypes.ExternalFile,
            callable: callable,
            errors: [],
            sources: files
        }
    }
}
export type OutgoingReporter = Rx.Subject<OutgoingReport>;
export function getOutputObserver(mergedConfig: CrossbowConfiguration, outputObserver: OutgoingReporter) {

    /**
     * If an outputObserver was passed in with configuration (flags)
     */
    if (mergedConfig.outputObserver) {
        return mergedConfig.outputObserver;
    }

    /**
     * If an output observer was passed in via initial setup (cli fallback)
     */
    if (outputObserver) {
        return outputObserver;
    }

    /**
     * Default is to log each report to the console
     */
    const defaultOutputObserver = new Rx.Subject<OutgoingReport>();

    defaultOutputObserver.subscribe(xs => {
        xs.data.forEach(function (x) {
            logger.info(x);
        });
    });

    return defaultOutputObserver;
}

export function getDefaultReporter () {
    return require('./reporters/defaultReporter').default;
}

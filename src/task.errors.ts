import {CrossbowInput} from "./index";
import {
    TaskError,
    TaskNotFoundError,
    CBFlagNotProvidedError,
    SubtaskNotProvidedError,
    SubtasksNotInConfigError,
    SubtaskNotFoundError,
    SubtaskWildcardNotAvailableError
} from "./task.errors.d";
import {Task} from "./task.resolve.d";
const objPath = require('object-path');

export enum TaskErrorTypes {
    TaskNotFound = <any>"TaskNotFound",
    SubtasksNotInConfig = <any>"SubtasksNotInConfig",
    SubtaskNotProvided = <any>"SubtaskNotProvided",
    SubtaskNotFound = <any>"SubtaskNotFound",
    SubtaskWildcardNotAvailable = <any>"SubtaskWildcardNotAvailable",
    AdaptorNotFound = <any>"AdaptorNotFound",
    FlagNotFound = <any>"FlagNotFound",
    FlagNotProvided = <any>"FlagNotProvided"
}

export function gatherTaskErrors(task: Task, input: CrossbowInput): TaskError[] {
    return [
        getModuleErrors,
        getCBFlagErrors,
        getSubTaskErrors
    ].reduce((all, fn) => all.concat(fn(task, input)), []);
}

function getModuleErrors(task: Task): TaskError[] {
    /**
     * If there are inline functions to execute, this task can never be invalid
     */
    if (task.inlineFunctions.length) {
        return [];
    }
    
    /**
     * If a module was not located, and there are 0 child tasks,
     * this can be classified as a `module not found error`
     */
    if (task.modules.length === 0 && task.tasks.length === 0) {
        return [<TaskNotFoundError>{type: TaskErrorTypes.TaskNotFound, taskName: task.taskName}]
    }

    return [];
}

function getCBFlagErrors(task: Task): TaskError[] {
    return task.cbflags.reduce((all, flag) => {
        /**
         * if `flag` is an empty string, the user provided an @ after a task
         * name, but without the right-hand part.
         * eg:
         *   $ crossbow run build-css@
         *
         * when it should of been
         *   $ crossbow run build-css@p
         *
         */
        if (flag === '') {
            return all.concat(<CBFlagNotProvidedError>{
                type: TaskErrorTypes.FlagNotProvided,
                taskName: task.taskName
            });
        }

        return all;
    }, []);
}

function getSubTaskErrors(task: Task, input: CrossbowInput): TaskError[] {
    /**
     * Now validate any subtasks given with colon syntax
     *  eg: sass:dev
     *   -> must have a configuration object under the key sass.dev
     *   -> VALID
     *      config:
     *        sass:
     *          dev: 'input.scss'
     */
    return task.subTasks.reduce((all, subTaskName) => {
        const configKeys = Object.keys(objPath.get(input, ['options'].concat(task.baseTaskName), {}));
        /**
         * if `name` is an empty string, the user provided a colon-separated task
         * name without the right-hand part.
         * eg:
         *   $ crossbow run sass:
         *
         * when it should of been
         *   $ crossbow run sass:site:dev
         *
         */
        if (subTaskName === '') {
            return all.concat(<SubtaskNotProvidedError>{
                type: TaskErrorTypes.SubtaskNotProvided,
                name: subTaskName
            });
        }

        /**
         * if a star was given as a subTask,
         * then this item must have configuration
         * as we'll want to run once with each key
         */
        if (subTaskName === '*') {
            return all.concat(handleWildcardSubtask(configKeys, subTaskName));
        }

        if (!configKeys.length) {
            return all.concat(<SubtasksNotInConfigError>{
                type: TaskErrorTypes.SubtasksNotInConfig,
                name: subTaskName
            });
        }

        /**
         * Finally check if there's configuration that Matches this
         * key.
         */
        const match = objPath.get(input, ['options'].concat(task.baseTaskName, subTaskName));
        if (match === undefined) {
            return all.concat(<SubtaskNotFoundError>{
                type: TaskErrorTypes.SubtaskNotFound,
                name: subTaskName
            });
        }

        return all;

    }, []);
}

function handleWildcardSubtask(configKeys: string[], name: string): SubtaskWildcardNotAvailableError[] {

    if (configKeys.length) {
        return [];
    }

    return [{
        type: TaskErrorTypes.SubtaskWildcardNotAvailable,
        name: name
    }];
}

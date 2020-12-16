import * as async from 'async';
import { Gitlab } from '@gitbeaker/browser';
import { getSettings } from '../utils/getSettings';
import { GetSettingsResponse, GitlabAPI, Todo } from '../types';
import { browser } from 'webextension-polyfill-ts';

export const setTodoAsDone = (id: number | null, cb: CallbackErrorOnly) => {
    interface AsyncResults {
        getSettings: GetSettingsResponse;
        gitlabApi: GitlabAPI;
        markAsDone: void;
        removeFromCache: void;
    }

    async.auto<AsyncResults>(
        {
            getSettings: (cb) => getSettings(cb),
            gitlabApi: [
                'getSettings',
                (results, cb) => {
                    if (!results.getSettings.token) {
                        return cb(new Error('No Gitlab token set, visit options.'));
                    }
                    if (!results.getSettings.address) {
                        return cb(new Error('No Gitlab host address set, visit options.'));
                    }

                    const api = new Gitlab({
                        host: results.getSettings.address,
                        token: results.getSettings.token
                    });

                    return cb(null, api);
                }
            ],
            markAsDone: [
                'gitlabApi',
                (results, cb) => {
                    const { gitlabApi } = results;
                    gitlabApi.Todos.done({ todoId: id })
                        .then(() => cb())
                        .catch((error: Error) => cb(error));
                }
            ],
            removeFromCache: [
                'markAsDone',
                (_results, cb) => {
                    browser.storage.local.get(['todos']).then((storage) => {
                        const currentTodos: Todo[] = storage.todos;

                        const newTodos = id ? currentTodos.filter((todo) => todo.id !== id) : [];

                        browser.storage.local.set({ todos: newTodos }).then(() => cb());
                    });
                }
            ]
        },
        (error) => {
            if (error) {
                return cb(error);
            }
            return cb();
        }
    );
};

import * as async from 'async';
import { Gitlab } from '@gitbeaker/browser';
import { getSettings } from './utils/getSettings';
import { GetSettingsResponse, GitlabAPI } from './types';

export const setTodoAsDone = (id: number, cb: CallbackErrorOnly) => {
    interface AsyncResults {
        getSettings: GetSettingsResponse;
        gitlabApi: GitlabAPI;
        markAsDone: void;
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

import * as browser from 'webextension-polyfill';
import { getMembersOfGroup, getProjectsList, setTodoAsDone } from './endpoints/index.js';
import { getConfiguration, setGlobalError } from '../common/storage/index.js';
import { routine } from './routine.js';
import { logger } from '../common/logger.js';
import { FailFetchSettings, GitLabNoAccount } from '../common/errors.js';

logger('Background script loaded');

let time: number; // dynamic interval
getConfiguration(['accounts', 'refreshRate']).then(async (settings) => {
    if (!settings) {
        await setGlobalError(new FailFetchSettings());
    }

    if (!settings.accounts || settings.accounts.length === 0) {
        await setGlobalError(new GitLabNoAccount());
    }

    time = settings.refreshRate;

    browser.alarms.create('fetchGitLab', { when: Date.now() });

    browser.alarms.onAlarm.addListener(async () => {
        try {
            await routine({});
            await setGlobalError(null);
        } catch (error) {
            if (error instanceof Error) {
                await setGlobalError(error);
            }
        }
        logger('Next refresh in', time);
        await browser.alarms.clear('fetchGitLab');
        browser.alarms.create('fetchGitLab', { when: Date.now() + time * 1000 });
    });
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'ping') {
        return Promise.resolve('pong');
    }

    if (message.type === 'getLatestDataFromGitLab') {
        return new Promise(async (resolve) => {
            try {
                const { collectedErrors } = await routine({});
                await setGlobalError(null);
                resolve(collectedErrors.length === 0);
            } catch (error) {
                if (error instanceof Error) {
                    await setGlobalError(error);
                }
                resolve(false);
            }
        });
    }

    if (message.type === 'testAccount') {
        return new Promise(async (resolve) => {
            try {
                const { collectedErrors } = await routine({ accountUuids: [message.accountUuid] });
                await setGlobalError(null);
                resolve(collectedErrors.length === 0);
            } catch (error) {
                if (error instanceof Error) {
                    await setGlobalError(error);
                }
                resolve(false);
            }
        });
    }

    if (message.type === 'setTodoAsDone') {
        return setTodoAsDone(message.accountUuid, message.todoId);
    }

    if (message.type === 'getProjectsList') {
        return getProjectsList();
    }

    if (message.type === 'getMembersOfGroup') {
        return getMembersOfGroup(message.groupId);
    }

    if (message.type === 'updateRefreshRate') {
        time = message.interval;
        return;
    }
});

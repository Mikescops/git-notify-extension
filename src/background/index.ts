import * as browser from 'webextension-polyfill';
import { getMembersOfGroup, getProjectsList, routine, setTodoAsDone } from './endpoints';
import { setGlobalError } from '../common/globalError';
import { readConfiguration } from '../common/configuration';

console.log('background script loaded');

let time: number; // dynamic interval
readConfiguration<{ refreshRate: number }>(['refreshRate']).then((settings) => {
    time = settings.refreshRate;

    browser.alarms.create('fetchGitLab', { when: Date.now() });

    browser.alarms.onAlarm.addListener(async () => {
        try {
            await routine();
            await setGlobalError(null);
        } catch (error) {
            if (error instanceof Error) {
                await setGlobalError(error);
            }
        }
        console.log('Next refresh in', time);
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
                await routine();
                await setGlobalError(null);
                resolve(true);
            } catch (error) {
                if (error instanceof Error) {
                    await setGlobalError(error);
                }
                resolve(false);
            }
        });
    }

    if (message.type === 'setTodoAsDone') {
        return setTodoAsDone(message.todoId);
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

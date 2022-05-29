import * as browser from 'webextension-polyfill';
import { getLatestDataFromGitLab, getLocalData, setTodoAsDone } from './endpoints';
import { getProjectsList } from './endpoints/getProjectsList';
import { getMembersOfGroup } from './endpoints/getMembersOfGroup';
import { setGlobalError } from './utils/globalError';

console.log('background script loaded');

let time: number; // dynamic interval
browser.storage.local.get(['refreshRate']).then((settings) => {
    time = settings.refreshRate ? settings.refreshRate : 40;

    browser.alarms.create('fetchGitLab', { when: Date.now() });

    browser.alarms.onAlarm.addListener(async () => {
        try {
            await getLatestDataFromGitLab();
            await setGlobalError(null);
        } catch (error) {
            if (error instanceof Error) {
                await setGlobalError(error);
            }
        }
        console.log('Next refresh in', time);
        browser.alarms.clear('fetchGitLab');
        browser.alarms.create('fetchGitLab', { when: Date.now() + time * 1000 });
    });
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'getLocalData') {
        return getLocalData();
    }

    if (message.type === 'getLatestDataFromGitLab') {
        return new Promise(async (resolve) => {
            try {
                await getLatestDataFromGitLab();
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

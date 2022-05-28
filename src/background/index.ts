import { browser } from 'webextension-polyfill-ts';
import { getLatestDataFromGitLab, getLocalData, setTodoAsDone } from './endpoints';
import { getProjectsList } from './endpoints/getProjectsList';
import { pickRandomMemberOfGroup } from './endpoints/pickRandomMemberOfGroup';
import { setBadge } from './utils/setBadge';

let ERROR_TRACKER: Error | null;

console.log('background script loaded');

let time: number; // dynamic interval
browser.storage.local.get(['refreshRate']).then((settings) => {
    time = settings.refreshRate ? settings.refreshRate : 40;

    browser.alarms.create('fetchGitLab', { when: Date.now() });

    browser.alarms.onAlarm.addListener(async () => {
        try {
            await getLatestDataFromGitLab();
            ERROR_TRACKER = null;
        } catch (error) {
            if (error instanceof Error) {
                ERROR_TRACKER = error;
                setBadge('Error', 'red');
            }
        }
        console.log('Next refresh in', time);
        browser.alarms.clear('fetchGitLab');
        browser.alarms.create('fetchGitLab', { when: Date.now() + time * 1000 });
    });
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'getLocalData') {
        return getLocalData(ERROR_TRACKER);
    }

    if (message.type === 'getLatestDataFromGitLab') {
        return new Promise(async (resolve) => {
            try {
                await getLatestDataFromGitLab();
                ERROR_TRACKER = null;
                resolve(true);
            } catch (error) {
                if (error instanceof Error) {
                    ERROR_TRACKER = error;
                    setBadge('Error', 'red');
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

    if (message.type === 'pickRandomMemberOfGroup') {
        return pickRandomMemberOfGroup(message.groupId);
    }

    if (message.type === 'updateRefreshRate') {
        time = message.interval;
        return;
    }
});

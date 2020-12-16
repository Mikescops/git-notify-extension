import { browser } from 'webextension-polyfill-ts';
import { getLatestDataFromGitLab, getLocalData, setTodoAsDone } from './endpoints';

let ERROR_TRACKER: Error | null;

console.log('background script loaded');

let time: number; // dynamic interval
browser.storage.local.get(['refreshRate']).then((settings) => {
    time = settings.refreshRate ? settings.refreshRate : 40;

    (function repeat() {
        getLatestDataFromGitLab((error) => (ERROR_TRACKER = error || null));
        console.log('Next refresh in', time);
        setTimeout(repeat, time * 1000);
    })();
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'getLocalData') {
        return getLocalData(ERROR_TRACKER);
    }

    if (message.type === 'getLatestDataFromGitLab') {
        return new Promise((resolve) =>
            getLatestDataFromGitLab((error) => {
                if (error) {
                    ERROR_TRACKER = error;
                    return resolve(false);
                }
                return resolve(true);
            })
        );
    }

    if (message.type === 'setTodoAsDone') {
        return new Promise((resolve) => setTodoAsDone(message.todoId, (error) => resolve(error)));
    }

    if (message.type === 'updateRefreshRate') {
        time = message.interval;
        return;
    }
});

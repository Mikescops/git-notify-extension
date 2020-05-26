import { browser } from 'webextension-polyfill-ts';
import { setTodoAsDone } from './setTodoAsDone';
import { pollGitlab } from './pollGitlab';

let ERROR_TRACKER: Error | null;

console.log('background script loaded');

let time: number; // dynamic interval
browser.storage.local.get(['refreshRate']).then((settings) => {
    time = settings.refreshRate ? settings.refreshRate : 40;

    (function repeat() {
        pollGitlab((error) => (ERROR_TRACKER = error));
        console.log('Next refresh in', time);
        setTimeout(repeat, time * 1000);
    })();
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'getMRs') {
        if (ERROR_TRACKER) {
            return Promise.resolve({ error: ERROR_TRACKER.message });
        }

        return Promise.resolve(
            browser.storage.local.get([
                'mrAssigned',
                'mrGiven',
                'mrToReview',
                'mrReviewed',
                'issuesAssigned',
                'todos',
                'lastUpdateDateUnix'
            ])
        );
    }

    if (message.type === 'pollMR') {
        return new Promise((resolve) =>
            pollGitlab((error, result) => {
                ERROR_TRACKER = error;
                return resolve(result);
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

import { browser } from 'webextension-polyfill-ts';
import { setTodoAsDone } from './setTodoAsDone';
import { pollGitlab } from './pollGitlab';

let ERROR_TRACKER: Error | null;

console.log('background script loaded');
pollGitlab((error) => (ERROR_TRACKER = error));
setInterval(function run() {
    pollGitlab((error) => (ERROR_TRACKER = error));
}, 30000);

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
                'todos',
                'lastUpdateDateUnix'
            ])
        );
    }

    if (message.type === 'pollMR') {
        return new Promise((resolve) => pollGitlab((_error, result) => resolve(result)));
    }

    if (message.type === 'setTodoAsDone') {
        return new Promise((resolve) => setTodoAsDone(message.todoId, (error) => resolve(error)));
    }
});

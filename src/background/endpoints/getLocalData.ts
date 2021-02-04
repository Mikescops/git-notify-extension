import { browser } from 'webextension-polyfill-ts';

export const getLocalData = (global_error: Error | null) => {
    if (global_error) {
        return Promise.resolve({ error: global_error.message });
    }

    return Promise.resolve(
        browser.storage.local.get([
            'mrReceived',
            'mrGiven',
            'mrToReview',
            'mrReviewed',
            'issuesAssigned',
            'todos',
            'lastUpdateDateUnix'
        ])
    );
};

import * as browser from 'webextension-polyfill';
import { getGlobalError } from '../utils/globalError';

export const getLocalData = async () => {
    const globalError = await getGlobalError();

    if (globalError) {
        return Promise.resolve({ error: globalError });
    }

    return await browser.storage.local.get([
        'mrReceived',
        'mrGiven',
        'mrToReview',
        'mrReviewed',
        'myDrafts',
        'issues',
        'todos',
        'lastUpdateDateUnix'
    ]);
};

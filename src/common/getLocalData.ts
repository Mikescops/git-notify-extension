import { getGlobalError } from './globalError';
import { Storage } from './storage';

export const getLocalData = async () => {
    const globalError = await getGlobalError();

    if (globalError) {
        return Promise.resolve({ error: globalError });
    }

    return new Storage().getKeys([
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

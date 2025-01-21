import * as browser from 'webextension-polyfill';
import { getGlobalError } from '../../common/storage/index.js';

const REQUEST_TYPE_PING = 'ping';

export const pingBackend = async (forceRefresh?: boolean): Promise<Error | null> => {
    if (forceRefresh) {
        if ((await browser.runtime.sendMessage({ type: 'getLatestDataFromGitLab' })) !== true) {
            return getGlobalError();
        }
    } else if ((await browser.runtime.sendMessage({ type: REQUEST_TYPE_PING })) !== 'pong') {
        return new Error('Extension backend is unresponsive, try to reload the extension');
    }

    return getGlobalError();
};

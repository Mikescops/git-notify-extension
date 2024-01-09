import * as browser from 'webextension-polyfill';
import { getGlobalError } from '../../common/globalError';

const REQUEST_TYPE_PING = 'ping';

export const pingBackend = async (forceRefresh?: boolean): Promise<Error | undefined> => {
    if (forceRefresh) {
        if ((await browser.runtime.sendMessage({ type: 'getLatestDataFromGitLab' })) !== true) {
            return getGlobalError();
        }
    } else if ((await browser.runtime.sendMessage({ type: REQUEST_TYPE_PING })) !== 'pong') {
        return new Error('Extension backend is unresponsive, try to reload the extension');
    }

    return;
};

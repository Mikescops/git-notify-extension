import * as browser from 'webextension-polyfill';
import { GitLabAddressNotSet, GitLabTokenNotSet, GlobalError } from './errors';
import { setBadge } from '../background/utils/setBadge';

export const setGlobalError = async (error: Error | null) => {
    if (error) {
        const globalError = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };

        const badgeColor =
            error instanceof GitLabAddressNotSet || error instanceof GitLabTokenNotSet ? 'orange' : 'red';
        await setBadge('!', badgeColor);

        return await browser.storage.local.set({ globalError: JSON.stringify(globalError) });
    }
    return await browser.storage.local.remove('globalError');
};

export const getGlobalError = async (): Promise<GlobalError> => {
    const { globalError } = await browser.storage.local.get('globalError');
    return globalError ? JSON.parse(globalError) : null;
};

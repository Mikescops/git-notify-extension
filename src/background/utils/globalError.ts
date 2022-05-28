import * as browser from 'webextension-polyfill';
import { GlobalError } from '../types';
import { setBadge } from './setBadge';

export const setGlobalError = async (error: Error | null) => {
    if (error) {
        const globalError = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
        setBadge('Error', 'red');
        return await browser.storage.local.set({ globalError: JSON.stringify(globalError) });
    }
    return await browser.storage.local.remove('globalError');
};

export const getGlobalError = async (): Promise<GlobalError> => {
    const { globalError } = await browser.storage.local.get('globalError');
    return globalError ? JSON.parse(globalError) : null;
};

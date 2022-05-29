import * as browser from 'webextension-polyfill';

export const updateConfiguration = async (objectToStore: Record<string, any>): Promise<void> => {
    await browser.storage.local.set(objectToStore);
    console.log('Configuration Updated');
};

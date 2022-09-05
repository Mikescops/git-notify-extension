import * as browser from 'webextension-polyfill';
import { TabId } from '../common/types';

export const updateConfiguration = async (objectToStore: Record<string, any>): Promise<void> => {
    await browser.storage.local.set(objectToStore);
    console.log('Configuration Updated');
};

export const readConfiguration = async (keys: string[]): Promise<Record<string, any>> => {
    return browser.storage.local.get(keys).then((settings) => {
        if (typeof settings.defaultTab === 'number') {
            const legacyMapping: { [key: number]: TabId } = {
                0: 'to_review',
                1: 'under_review',
                2: 'issues',
                3: 'todo_list'
            };
            settings.defaultTab = legacyMapping[settings.defaultTab] ?? 'to_review';
        }
        return settings;
    });
};

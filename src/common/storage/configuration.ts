import localforage from 'localforage';
import { Account, Configuration, TabId } from '../types';
import { config } from '../../config/config';
import { logger } from '../logger';

const configStorage = localforage.createInstance({
    name: 'AppConfig',
    storeName: 'configuration'
});

// Update configuration
export const updateConfiguration = async (objectToStore: Partial<Configuration>): Promise<void> => {
    try {
        for (const [key, value] of Object.entries(objectToStore)) {
            await configStorage.setItem(key, value);
        }
        logger('Configuration Updated');
    } catch (error) {
        console.error('Error updating configuration:', error);
    }
};

// Update specific account configuration
export const updateAccountConfiguration = async (
    accountIndex: number,
    objectToStore: Partial<Account>
): Promise<void> => {
    const settings = await getConfiguration(['accounts']);
    if (!Array.isArray(settings.accounts)) {
        settings.accounts = [];
    }
    settings.accounts[accountIndex] = { ...settings.accounts[accountIndex], ...objectToStore };
    await updateConfiguration({ accounts: settings.accounts });
};

// Read configuration
export const getConfiguration = async <T extends keyof Configuration>(keys: T[]): Promise<Pick<Configuration, T>> => {
    const settings: Partial<Configuration> = {};

    try {
        for (const key of keys) {
            const value = await configStorage.getItem<Configuration[T]>(key as string);
            settings[key] = value !== null ? value : (config as Configuration)[key];
        }

        // Handle legacy mapping for defaultTab
        if (typeof settings.defaultTab === 'number') {
            const legacyMapping: { [key: number]: TabId } = {
                0: 'to_review',
                1: 'under_review',
                2: 'issues',
                3: 'todo_list'
            };
            settings.defaultTab = legacyMapping[settings.defaultTab] ?? 'to_review';
        }

        // Convert accounts string to array if needed
        if (typeof settings.accounts === 'string') {
            const accounts = JSON.parse(settings.accounts);
            settings.accounts = accounts.map((account: any) => ({
                token: account.token,
                address: account.address,
                gitlabCE: Boolean(account.gitlabCE),
                draftInToReviewTab: Boolean(account.draftInToReviewTab),
                projectDirectoryPrefix: account.projectDirectoryPrefix
            }));
        }

        return settings as Pick<Configuration, T>;
    } catch (error) {
        console.error('Error reading configuration:', error);
        throw error;
    }
};

// Default empty account
export const defaultEmptyAccount: () => Account = () => ({
    uuid: globalThis.crypto.randomUUID(),
    token: '',
    address: '',
    gitlabCE: false,
    draftInToReviewTab: false,
    projectDirectoryPrefix: ''
});

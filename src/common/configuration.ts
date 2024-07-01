import { Account, Configuration, TabId } from '../common/types';
import { config } from '../config/config';
import { Storage } from './storage';

export const updateConfiguration = async (objectToStore: Record<string, any>): Promise<void> => {
    const storage = new Storage();

    await storage.setKeys({ configuration: objectToStore });
    console.log('Configuration Updated');
};

export const updateAccountConfiguration = async (
    accountIndex: number,
    objectToStore: Record<string, any>
): Promise<void> => {
    const settings = await readConfiguration<Configuration>(['accounts']);
    settings.accounts[accountIndex] = { ...settings.accounts[accountIndex], ...objectToStore };
    await updateConfiguration({ accounts: settings.accounts });
};

export const readConfiguration = async <T>(keys: string[]): Promise<T> => {
    const storage = new Storage();

    return storage.getKeys(['configuration']).then(({ configuration }) => {
        if (!configuration) {
            return config as T;
        }

        if (typeof configuration.defaultTab === 'number') {
            const legacyMapping: { [key: number]: TabId } = {
                0: 'to_review',
                1: 'under_review',
                2: 'issues',
                3: 'todo_list'
            };
            configuration.defaultTab = legacyMapping[configuration.defaultTab] ?? 'to_review';
        }

        if (typeof configuration.accounts === 'string') {
            const accounts = JSON.parse(configuration.accounts);

            configuration.accounts =
                accounts?.map((account: any) => ({
                    token: account.token,
                    address: account.address,
                    gitlabCE: Boolean(account.gitlabCE),
                    draftInToReviewTab: Boolean(account.draftInToReviewTab),
                    projectDirectoryPrefix: account.projectDirectoryPrefix
                })) ?? [];
        }

        for (const setting of keys) {
            if (configuration[setting] === undefined) {
                configuration[setting] = (config as Record<string, any>)[setting] ?? undefined;
            }
        }

        return configuration as T;
    });
};

export const defaultEmptyAccount: Account = {
    token: '',
    address: '',
    gitlabCE: false,
    draftInToReviewTab: false,
    projectDirectoryPrefix: ''
};

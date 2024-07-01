import * as browser from 'webextension-polyfill';

enum StorageKeysEnum {
    mrReceived = 'mrReceived',
    mrToReview = 'mrToReview',
    mrGiven = 'mrGiven',
    mrReviewed = 'mrReviewed',
    myDrafts = 'myDrafts',
    issues = 'issues',
    todos = 'todos',
    lastUpdateDateUnix = 'lastUpdateDateUnix',
    globalError = 'globalError',
    configuration = 'configuration'
}

type StorageKeys = keyof typeof StorageKeysEnum;

export class Storage {
    namespace: 'git-notify';

    constructor() {
        this.namespace = 'git-notify';

        if (!browser.storage.local.get(this.namespace)) {
            browser.storage.local.set({ [this.namespace]: JSON.stringify({}) });
        }
    }

    async clear() {
        return await browser.storage.local.remove(this.namespace);
    }

    async getKeys(keys: StorageKeys[]): Promise<Partial<Record<StorageKeys, any>>> {
        const storage = await browser.storage.local.get(this.namespace);

        if (!storage[this.namespace]) {
            return {};
        }

        return keys.reduce(
            (acc, key) => {
                acc[key] = storage[this.namespace][key];
                return acc;
            },
            {} as Record<StorageKeys, any>
        );
    }

    async setKeys(data: Partial<Record<StorageKeys, any>>) {
        return await browser.storage.local.get(this.namespace).then((storage) => {
            console.log('storage', storage);

            const parsedStorage = storage[this.namespace] ?? {};

            return browser.storage.local.set({ [this.namespace]: { ...parsedStorage, ...data } });
        });
    }

    async removeKey(key: StorageKeys) {
        await browser.storage.local.get(this.namespace).then((storage) => {
            const parsedStorage = storage[this.namespace] ?? {};

            delete parsedStorage[key];

            return browser.storage.local.set({ [this.namespace]: parsedStorage });
        });
    }
}

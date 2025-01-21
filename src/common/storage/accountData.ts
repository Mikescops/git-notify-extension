import localforage from 'localforage';
import { IssueSchema, TodoSchema } from '@gitbeaker/rest';
import { ErrorKeys, MergeRequestsDetails } from '../types';

const accountStorageInstances = new Map<string, LocalForage>();

export interface AccountData {
    mrReviewed: number;
    mrToReview: number;
    mrReceived: MergeRequestsDetails[] | Error;
    mrGiven: MergeRequestsDetails[] | Error;
    myDrafts: MergeRequestsDetails[] | Error;
    issues: IssueSchema[] | Error;
    todos: TodoSchema[] | Error;
    lastUpdateDateUnix: number;
    errors: Partial<Record<ErrorKeys, Error>>;
}

/**
 * Create a localforage instance for an account and cache it.
 */
const createAccountStorage = (accountUuid: string): LocalForage => {
    const instance = localforage.createInstance({
        name: 'AccountData',
        storeName: `account_${accountUuid}`
    });
    accountStorageInstances.set(accountUuid, instance);
    return instance;
};

/**
 * Get or create a localforage instance for an account.
 */
export const getOrCreateAccountStorage = (accountUuid: string): LocalForage => {
    if (!accountStorageInstances.has(accountUuid)) {
        return createAccountStorage(accountUuid);
    }
    const currentInstance = accountStorageInstances.get(accountUuid);
    if (!currentInstance) {
        throw new Error('Account storage instance not found');
    }
    return currentInstance;
};

export const clearAccountStorage = async (accountUuid: string) => {
    accountStorageInstances.delete(accountUuid);
    await localforage.dropInstance({
        name: 'AccountData',
        storeName: `account_${accountUuid}`
    });
};

/**
 * Retrieve all data for a specific account.
 */
export const getAccountData = async (accountUuid: string): Promise<AccountData> => {
    const accountStorage = getOrCreateAccountStorage(accountUuid);

    const errors: Partial<Record<ErrorKeys, Error>> = {};

    const safeFetch = async <T>(key: string): Promise<T | null> => {
        try {
            return await accountStorage.getItem<T>(key);
        } catch (error) {
            console.error(`Failed to fetch data for key "${key}" in account ${accountUuid}:`, error);
            errors[key as ErrorKeys] = error instanceof Error ? error : new Error(`Unknown error for key "${key}"`);
            return null;
        }
    };

    const [mrReviewed, mrToReview, mrReceived, mrGiven, myDrafts, issues, todos, lastUpdateDateUnix, generalError] =
        await Promise.all([
            safeFetch<number>('mrReviewed'),
            safeFetch<number>('mrToReview'),
            safeFetch<MergeRequestsDetails[] | Error>('mrReceived'),
            safeFetch<MergeRequestsDetails[] | Error>('mrGiven'),
            safeFetch<MergeRequestsDetails[] | Error>('myDrafts'),
            safeFetch<IssueSchema[] | Error>('issues'),
            safeFetch<TodoSchema[] | Error>('todos'),
            safeFetch<number>('lastUpdateDateUnix'),
            safeFetch<Error>('error')
        ]);

    return {
        mrReviewed: mrReviewed || 0,
        mrToReview: mrToReview || 0,
        mrReceived: mrReceived || (errors.mrReceived ? new Error('Error fetching mrReceived data') : []),
        mrGiven: mrGiven || (errors.mrGiven ? new Error('Error fetching mrGiven data') : []),
        myDrafts: myDrafts || (errors.myDrafts ? new Error('Error fetching myDrafts data') : []),
        issues: issues || (errors.issues ? new Error('Error fetching issues data') : []),
        todos: todos || (errors.todos ? new Error('Error fetching todos data') : []),
        lastUpdateDateUnix: lastUpdateDateUnix || 0,
        errors: {
            ...(generalError ? { general: generalError } : {}),
            ...(Object.keys(errors).length > 0 ? errors : {})
        }
    };
};

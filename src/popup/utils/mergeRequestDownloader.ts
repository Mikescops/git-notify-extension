import { IssueSchema, TodoSchema } from '@gitbeaker/rest';
import { getAccountData, getConfiguration } from '../../common/storage';
import { ErrorKeys, MergeRequestsDetails } from '../../common/types';

export interface MergeRequestSendMessageReply {
    mrReceived: MergeRequestsDetails[];
    mrToReview: number;
    mrGiven: MergeRequestsDetails[];
    mrReviewed: number;
    myDrafts: MergeRequestsDetails[];
    issues: IssueSchema[];
    todos: TodoSchema[];
    lastUpdateDateUnix: number;
    errors: {
        uuid: string;
        errors: Partial<Record<ErrorKeys, Error>>;
    }[];
}

// Function to fetch and merge data from all accounts
export const getMergeRequestList = async (): Promise<MergeRequestSendMessageReply> => {
    try {
        const { accounts } = await getConfiguration(['accounts']);

        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts configured');
        }

        const mergedData: MergeRequestSendMessageReply = {
            mrReceived: [],
            mrToReview: 0,
            mrGiven: [],
            mrReviewed: 0,
            myDrafts: [],
            issues: [],
            todos: [],
            lastUpdateDateUnix: 0,
            errors: []
        };

        // Fetch data from each account's storage and merge
        for (const account of accounts) {
            const data = await getAccountData(account.uuid);

            if (data) {
                mergedData.mrReceived.push(...(!(data.mrReceived instanceof Error) ? data.mrReceived : []));
                mergedData.mrToReview += data.mrToReview;
                mergedData.mrGiven.push(...(!(data.mrGiven instanceof Error) ? data.mrGiven : []));
                mergedData.mrReviewed += data.mrReviewed;
                mergedData.myDrafts.push(...(!(data.myDrafts instanceof Error) ? data.myDrafts : []));
                mergedData.issues.push(...(!(data.issues instanceof Error) ? data.issues : []));
                mergedData.todos.push(...(!(data.todos instanceof Error) ? data.todos : []));
                mergedData.lastUpdateDateUnix = Math.max(mergedData.lastUpdateDateUnix, data.lastUpdateDateUnix);
                mergedData.errors = [...mergedData.errors, ...[{ uuid: account.uuid, errors: data.errors }]];
            }
        }

        return mergedData;
    } catch (error) {
        console.error('Failed to fetch merge request list:', error);
        return {
            mrReceived: [],
            mrToReview: 0,
            mrGiven: [],
            mrReviewed: 0,
            myDrafts: [],
            issues: [],
            todos: [],
            lastUpdateDateUnix: Date.now(),
            errors: []
        };
    }
};

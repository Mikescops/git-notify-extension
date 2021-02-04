import { browser } from 'webextension-polyfill-ts';
import { MergeRequestsDetails, Todo, Issue } from '../../background/types';

const REQUEST_TYPE_GET_LOCAL_DATA = 'getLocalData';

export interface MergeRequestSendMessageReply {
    mrReceived: MergeRequestsDetails[];
    mrToReview: number;
    mrGiven: MergeRequestsDetails[];
    mrReviewed: number;
    issuesAssigned: Issue[];
    todos: Todo[];
    lastUpdateDateUnix: number;
    error?: string;
}

export const getMergeRequestList = (): Promise<MergeRequestSendMessageReply> => {
    return browser.runtime
        .sendMessage({ type: REQUEST_TYPE_GET_LOCAL_DATA })
        .then((response) => {
            if (!response) {
                return {
                    error: 'No reponse received',
                    mrReceived: [],
                    mrToReview: 0,
                    mrGiven: [],
                    mrReviewed: 0,
                    issuesAssigned: [],
                    todos: [],
                    lastUpdateDateUnix: Date.now()
                };
            }
            return response;
        })
        .catch((error) => {
            return {
                error: error,
                mrReceived: [],
                mrToReview: 0,
                mrGiven: [],
                mrReviewed: 0,
                issuesAssigned: [],
                todos: [],
                lastUpdateDateUnix: Date.now()
            };
        });
};

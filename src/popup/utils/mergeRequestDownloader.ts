import { browser } from 'webextension-polyfill-ts';
import { MergeRequestsDetails, GitlabTypes } from '../../background/types';

const REQUEST_TYPE_GET_LOCAL_DATA = 'getLocalData';

export interface MergeRequestSendMessageReply {
    mrReceived: MergeRequestsDetails[];
    mrToReview: number;
    mrGiven: MergeRequestsDetails[];
    mrReviewed: number;
    issuesAssigned: GitlabTypes.IssueSchema[];
    todos: GitlabTypes.TodoSchema[];
    lastUpdateDateUnix: number;
    error?: string;
}

export const getMergeRequestList = async (): Promise<MergeRequestSendMessageReply> => {
    const response = await browser.runtime.sendMessage({ type: REQUEST_TYPE_GET_LOCAL_DATA });

    if (response instanceof Error || !response) {
        return {
            error: response,
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
};

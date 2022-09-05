import * as browser from 'webextension-polyfill';
import { MergeRequestsDetails, GitlabTypes, GlobalError } from '../../background/types';

const REQUEST_TYPE_GET_LOCAL_DATA = 'getLocalData';

export interface MergeRequestSendMessageReply {
    mrReceived: MergeRequestsDetails[];
    mrToReview: number;
    mrGiven: MergeRequestsDetails[];
    mrReviewed: number;
    myDrafts: MergeRequestsDetails[];
    issues: GitlabTypes.IssueSchema[];
    todos: GitlabTypes.TodoSchema[];
    lastUpdateDateUnix: number;
    error?: GlobalError;
}

export const getMergeRequestList = async (): Promise<MergeRequestSendMessageReply> => {
    const response = await browser.runtime.sendMessage({ type: REQUEST_TYPE_GET_LOCAL_DATA });

    if (response instanceof Error || !response || response.error) {
        return {
            error: response.error || null,
            mrReceived: [],
            mrToReview: 0,
            mrGiven: [],
            mrReviewed: 0,
            myDrafts: [],
            issues: [],
            todos: [],
            lastUpdateDateUnix: Date.now()
        };
    }

    return response;
};

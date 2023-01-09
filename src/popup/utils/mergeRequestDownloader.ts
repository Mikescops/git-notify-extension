import * as browser from 'webextension-polyfill';
import { MergeRequestsDetails, GitlabTypes } from '../../background/types';
import { GlobalError } from '../../common/errors';

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
    const response = (await browser.runtime.sendMessage({
        type: REQUEST_TYPE_GET_LOCAL_DATA
    })) as MergeRequestSendMessageReply;

    if (response instanceof Error || !response || response.error) {
        return {
            error: response.error,
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

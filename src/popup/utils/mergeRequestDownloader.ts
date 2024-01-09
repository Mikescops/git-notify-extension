import { MergeRequestsDetails, GitlabTypes } from '../../background/types';
import { GlobalError } from '../../common/errors';
import { getLocalData } from '../../common/getLocalData';

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
    const response = await getLocalData();

    if ('error' in response) {
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

    return response as MergeRequestSendMessageReply;
};

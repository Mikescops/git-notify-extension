import { browser } from 'webextension-polyfill-ts';
import { MergeRequestsDetails } from '../background/types';

const REQUEST_TYPE_GET_MERGE_REQUESTS = 'getMRs';

export interface MergeRequestSendMessageReply {
    mrAssigned: MergeRequestsDetails[];
    mrToReview: number;
    mrGiven: MergeRequestsDetails[];
    mrReviewed: number;
    lastUpdateDateUnix: number;
    error?: string;
}

export const getMergeRequestList = async (): Promise<MergeRequestSendMessageReply> => {
    try {
        const response = await browser.runtime.sendMessage({ type: REQUEST_TYPE_GET_MERGE_REQUESTS });
        if (!response) {
            return {
                error: 'No reponse received',
                mrAssigned: [],
                mrToReview: 0,
                mrGiven: [],
                mrReviewed: 0,
                lastUpdateDateUnix: Date.now()
            };
        }
        return response;
    } catch (error) {
        return {
            error: error,
            mrAssigned: [],
            mrToReview: 0,
            mrGiven: [],
            mrReviewed: 0,
            lastUpdateDateUnix: Date.now()
        };
    }
};

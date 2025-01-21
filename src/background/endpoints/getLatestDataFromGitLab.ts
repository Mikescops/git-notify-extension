import { fetchMRExtraInfo } from '../utils/fetchMRExtraInfo';
import { removeDuplicateObjectFromArray } from '../../popup/helpers';
import { initGitlabApi } from '../utils/initGitlabApi';
import { IssueSchemaWithBasicLabels, MergeRequestSchemaWithBasicLabels, TodoSchema } from '@gitbeaker/rest';
import { Account, MergeRequestsDetails } from '../../common/types';

interface GetLatestDataFromGitLabParams {
    account: Account;
}

interface GetLatestDataFromGitLabResponse {
    mrReceivedDetails: MergeRequestsDetails[] | Error;
    mrToReview: number;
    mrGivenDetailsNoDraft: MergeRequestsDetails[] | Error;
    mrReviewed: number;
    myDrafts: MergeRequestsDetails[] | Error;
    issues: IssueSchemaWithBasicLabels[] | Error;
    todos: TodoSchema[] | Error;
    error?: Error;
}

export const getLatestDataFromGitLab = async (
    params: GetLatestDataFromGitLabParams
): Promise<GetLatestDataFromGitLabResponse> => {
    const { account } = params;

    let gitlabApi;
    try {
        gitlabApi = initGitlabApi({ account });
    } catch (error) {
        return {
            mrReceivedDetails: [],
            mrToReview: 0,
            mrGivenDetailsNoDraft: [],
            mrReviewed: 0,
            myDrafts: [],
            issues: [],
            todos: [],
            error: new Error('Failed to initialize GitLab API: ' + (error as Error).message)
        };
    }

    let currentUser;
    try {
        currentUser = await gitlabApi.Users.showCurrentUser();
    } catch (error) {
        return {
            mrReceivedDetails: [],
            mrToReview: 0,
            mrGivenDetailsNoDraft: [],
            mrReviewed: 0,
            myDrafts: [],
            issues: [],
            todos: [],
            error: new Error('Failed to fetch current user: ' + (error as Error).message)
        };
    }

    // Helper function for independent error handling in requests
    const safeFetch = async <T>(fetchFn: () => Promise<T>, defaultValue: T | Error): Promise<T | Error> => {
        try {
            return await fetchFn();
        } catch (error) {
            console.error('Fetch failed:', error);
            return defaultValue;
        }
    };

    // Fetch data with independent error handling
    const [mrAssigned, mrReceived, mrGiven, issues, todos] = await Promise.all([
        safeFetch(
            () =>
                gitlabApi.MergeRequests.all({
                    state: 'opened',
                    scope: 'assigned_to_me',
                    perPage: 100,
                    maxPages: 5
                }) as Promise<MergeRequestSchemaWithBasicLabels[]>,
            new Error('Failed to fetch MR assigned to user')
        ),
        safeFetch(
            () =>
                gitlabApi.MergeRequests.all({
                    state: 'opened',
                    scope: 'all',
                    reviewer_id: currentUser.id,
                    perPage: 100,
                    maxPages: 5
                }) as Promise<MergeRequestSchemaWithBasicLabels[]>,
            new Error('Failed to fetch MR received')
        ),
        safeFetch(
            () =>
                gitlabApi.MergeRequests.all({
                    state: 'opened',
                    scope: 'created_by_me',
                    perPage: 100,
                    maxPages: 5
                }) as Promise<MergeRequestSchemaWithBasicLabels[]>,
            new Error('Failed to fetch MR created by user')
        ),
        safeFetch(
            () =>
                gitlabApi.Issues.all({
                    state: 'opened',
                    scope: 'assigned_to_me',
                    perPage: 100,
                    maxPages: 5
                }) as Promise<IssueSchemaWithBasicLabels[]>,
            new Error('Failed to fetch issues')
        ),
        safeFetch(
            () => gitlabApi.TodoLists.all({ state: 'pending', perPage: 100, maxPages: 5 }) as Promise<TodoSchema[]>,
            new Error('Failed to fetch todos')
        )
    ]);

    // Process "MR Received" details if no error
    let mrReceivedDetails: MergeRequestsDetails[] | Error = [];
    let mrToReview = 0;
    if (!(mrReceived instanceof Error) && !(mrAssigned instanceof Error)) {
        const requests = removeDuplicateObjectFromArray([...mrAssigned, ...mrReceived], 'iid').filter(
            (merge) => merge.author.id !== currentUser.id
        );

        mrReceivedDetails = await safeFetch(
            () =>
                fetchMRExtraInfo({
                    gitlabApi,
                    mrList: requests,
                    gitlabCE: account.gitlabCE
                }),
            new Error('Failed to fetch extra MR Received details')
        );

        if (!(mrReceivedDetails instanceof Error)) {
            mrReceivedDetails = mrReceivedDetails.filter(
                (mr) => account.draftInToReviewTab || (!account.draftInToReviewTab && !mr.work_in_progress)
            );

            mrReceivedDetails.forEach((mr) => {
                if (!mr.approvals.user_has_approved) {
                    mrToReview += 1;
                }
            });
        }
    }

    // Process "MR Given" details if no error
    let mrGivenDetailsNoDraft: MergeRequestsDetails[] | Error = [];
    let myDrafts: MergeRequestsDetails[] | Error = [];
    let mrReviewed = 0;
    if (!(mrGiven instanceof Error)) {
        const mrGivenDetails = await safeFetch(
            () =>
                fetchMRExtraInfo({
                    gitlabApi,
                    mrList: mrGiven,
                    gitlabCE: account.gitlabCE
                }),
            new Error('Failed to fetch extra MR Given details')
        );

        if (!(mrGivenDetails instanceof Error)) {
            mrGivenDetailsNoDraft = mrGivenDetails.filter((mr) => !mr.work_in_progress);
            myDrafts = mrGivenDetails.filter((mr) => mr.work_in_progress);

            mrGivenDetailsNoDraft.forEach((mr) => {
                if (mr.approvals.approved) {
                    mrReviewed += 1;
                }
            });
        } else {
            mrGivenDetailsNoDraft = mrGivenDetails;
            myDrafts = mrGivenDetails;
        }
    }

    return {
        mrReceivedDetails,
        mrToReview,
        mrGivenDetailsNoDraft,
        mrReviewed,
        myDrafts,
        issues,
        todos
    };
};

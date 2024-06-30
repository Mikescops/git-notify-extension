import { fetchMRExtraInfo } from '../utils/fetchMRExtraInfo';
import { removeDuplicateObjectFromArray } from '../../popup/helpers';
import { initGitlabApi } from '../utils/initGitlabApi';
import { IssueSchemaWithBasicLabels, MergeRequestSchemaWithBasicLabels, TodoSchema } from '@gitbeaker/rest';
import { Account } from '../../common/types';
import { MergeRequestsDetails } from '../types';

interface GetLatestDataFromGitLabParams {
    account: Account;
}

interface GetLatestDataFromGitLabResponse {
    mrReceivedDetails: MergeRequestsDetails[];
    mrToReview: number;
    mrGivenDetailsNoDraft: MergeRequestsDetails[];
    mrReviewed: number;
    myDrafts: MergeRequestsDetails[];
    issues: IssueSchemaWithBasicLabels[];
    todos: TodoSchema[];
}

export const getLatestDataFromGitLab = async (
    params: GetLatestDataFromGitLabParams
): Promise<GetLatestDataFromGitLabResponse> => {
    const { account } = params;

    const gitlabApi = initGitlabApi({ account });
    const currentUser = await gitlabApi.Users.showCurrentUser();

    /** Fetching MR "To Review" */

    const mrAssignedRequest = gitlabApi.MergeRequests.all({
        state: 'opened',
        scope: 'assigned_to_me',
        perPage: 100,
        maxPages: 5
    }) as Promise<MergeRequestSchemaWithBasicLabels[]>;

    const mrReceivedRequest = gitlabApi.MergeRequests.all({
        state: 'opened',
        scope: 'all',
        reviewer_id: currentUser.id,
        perPage: 100,
        maxPages: 5
    }) as Promise<MergeRequestSchemaWithBasicLabels[]>;

    /** Fetching MR "Under review" */

    const mrGivenRequest = gitlabApi.MergeRequests.all({
        state: 'opened',
        scope: 'created_by_me',
        perPage: 100,
        maxPages: 5
    }) as Promise<MergeRequestSchemaWithBasicLabels[]>;

    /** Fetching "Issues" */

    const issuesRequest = gitlabApi.Issues.all({
        state: 'opened',
        scope: 'assigned_to_me',
        perPage: 100,
        maxPages: 5
    }) as Promise<IssueSchemaWithBasicLabels[]>;

    /** Fetching "Todos" */

    const todosRequest = gitlabApi.TodoLists.all({
        state: 'pending',
        perPage: 100,
        maxPages: 5
    }) as Promise<TodoSchema[]>;

    const [mrAssigned, mrReceived, mrGiven, issues, todos] = await Promise.all([
        mrAssignedRequest,
        mrReceivedRequest,
        mrGivenRequest,
        issuesRequest,
        todosRequest
    ]);

    // On gitlab you can be the author of an MR, tagged as assignee or reviewer
    // or all at the same time. We clean all unnecessary duplicates and MRs
    // current user is the creator of from the requests list.
    const requests = removeDuplicateObjectFromArray([...mrAssigned, ...mrReceived], 'iid').filter(
        (merge) => merge.author.id !== currentUser.id
    );

    const mrReceivedDetails = (
        await fetchMRExtraInfo({
            gitlabApi,
            mrList: requests,
            gitlabCE: account.gitlabCE
        })
    ).filter((mr) => account.draftInToReviewTab || (!account.draftInToReviewTab && !mr.work_in_progress));

    let mrToReview = 0;
    mrReceivedDetails.forEach((mr) => {
        if (!mr.approvals.user_has_approved) {
            mrToReview += 1;
        }
    });

    const mrGivenDetails = await fetchMRExtraInfo({
        gitlabApi,
        mrList: mrGiven,
        gitlabCE: account.gitlabCE
    });

    const mrGivenDetailsNoDraft = mrGivenDetails.filter((mr) => !mr.work_in_progress);

    let mrReviewed = 0;
    mrGivenDetailsNoDraft.forEach((mr) => {
        if (mr.approvals.approved) {
            mrReviewed += 1;
        }
    });

    /** Filtering "Drafts" */

    const myDrafts = mrGivenDetails.filter((mr) => mr.work_in_progress);

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

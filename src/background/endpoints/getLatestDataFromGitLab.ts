import * as browser from 'webextension-polyfill';
import { getSettings } from '../utils/getSettings';
import { fetchMRExtraInfo } from '../utils/fetchMRExtraInfo';
import { setBadge } from '../utils/setBadge';

import { removeDuplicateObjectFromArray } from '../../popup/helpers';
import { initGitlabApi } from '../utils/initGitlabApi';
import { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';

export const getLatestDataFromGitLab = async (): Promise<void> => {
    console.log('>> POLLING GITLAB API');

    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);
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
    });

    /** Fetching "Todos" */

    const todosRequest = gitlabApi.TodoLists.all({
        state: 'pending',
        perPage: 100,
        maxPages: 5
    });

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

    const mrReceivedDetails = await fetchMRExtraInfo({
        gitlabApi,
        mrList: requests,
        gitlabCE: settings.accounts[0].gitlabCE
    });

    let mrToReview = 0;
    mrReceivedDetails.forEach((mr) => {
        if (!mr.approvals.user_has_approved) {
            mrToReview += 1;
        }
    });

    const mrGivenDetails = await fetchMRExtraInfo({
        gitlabApi,
        mrList: mrGiven,
        gitlabCE: settings.accounts[0].gitlabCE
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

    /** Update alert badge */

    const alertBadgeCounters = settings.alertBadgeCounters;
    const badgeText = [];
    let badgeColor = 'black';

    if (alertBadgeCounters.includes(0) && (mrToReview > 0 || alertBadgeCounters.length > 1)) {
        badgeText.push(mrToReview);
        badgeColor = '#dc3545'; // red
    }
    if (alertBadgeCounters.includes(1) && (mrReviewed > 0 || alertBadgeCounters.length > 1)) {
        badgeText.push(mrReviewed);
        badgeColor = '#28a745'; // green
    }
    if (alertBadgeCounters.includes(2) && (issues.length > 0 || alertBadgeCounters.length > 1)) {
        badgeText.push(issues.length);
        badgeColor = '#fd7e14'; // orange
    }
    if (alertBadgeCounters.includes(3) && (todos.length > 0 || alertBadgeCounters.length > 1)) {
        badgeText.push(todos.length);
        badgeColor = '#1f78d1'; // blue
    }

    /** Save the fetched data */

    const lastUpdateDateUnix = new Date().getTime();

    await browser.storage.local.set({
        mrReceived: mrReceivedDetails,
        mrToReview,
        mrGiven: mrGivenDetailsNoDraft,
        mrReviewed,
        myDrafts,
        issues,
        todos,
        lastUpdateDateUnix
    });

    await setBadge(badgeText.length > 0 ? badgeText.join('⋅') : '', badgeColor);

    return console.log('API Fetched successfully');
};

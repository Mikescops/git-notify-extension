import * as browser from 'webextension-polyfill';
import { getSettings } from '../utils/getSettings';
import { fetchMRExtraInfo } from '../utils/fetchMRExtraInfo';
import { setBadge } from '../utils/setBadge';

import { removeDuplicateObjectFromArray } from '../../popup/helpers';
import { initGitlabApi } from '../utils/initGitlabApi';

export const getLatestDataFromGitLab = async (): Promise<void> => {
    console.log('>> POLLING GITLAB API');

    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);
    const currentUser = await gitlabApi.Users.current();

    const mrAssigned = await gitlabApi.MergeRequests.all({
        state: 'opened',
        scope: 'assigned_to_me'
    });
    const mrReceived = await gitlabApi.MergeRequests.all({
        state: 'opened',
        scope: 'all',
        reviewer_id: currentUser.id
    });

    const requests = removeDuplicateObjectFromArray([...mrAssigned, ...mrReceived], 'iid');

    const mrReceivedDetails = await fetchMRExtraInfo({
        gitlabApi,
        mrList: requests,
        gitlabCE: settings.gitlabCE
    });

    let mrToReview = 0;
    mrReceivedDetails.forEach((mr) => {
        if (!mr.approvals.user_has_approved) {
            mrToReview += 1;
        }
    });

    const mrGiven = await gitlabApi.MergeRequests.all({
        state: 'opened',
        scope: 'created_by_me'
    });

    const mrGivenDetails = await fetchMRExtraInfo({
        gitlabApi,
        mrList: mrGiven,
        gitlabCE: settings.gitlabCE
    });

    const mrGivenDetailsNoDraft = mrGivenDetails.filter((mr) => !mr.work_in_progress);

    let mrReviewed = 0;
    mrGivenDetailsNoDraft.forEach((mr) => {
        if (mr.approvals.approved) {
            mrReviewed += 1;
        }
    });

    const myDrafts = mrGivenDetails.filter((mr) => mr.work_in_progress);

    const issues = await gitlabApi.Issues.all({
        state: 'opened',
        scope: 'assigned_to_me'
    });

    const todos = await gitlabApi.Todos.all({
        state: 'pending',
        per_page: 100
    });

    // Update alert badge

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

    // Save the fetched data

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

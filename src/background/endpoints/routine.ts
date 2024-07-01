import { NoAccountSet } from '../../common/errors';
import { FailFetchSettings } from '../errors';
import { getSettings } from '../utils/getSettings';
import { setBadge } from '../utils/setBadge';
import { getLatestDataFromGitLab } from './getLatestDataFromGitLab';
import { Storage } from '../../common/storage';

export const routine = async (): Promise<void> => {
    console.log('>> POLLING GITLAB API');

    const settings = await getSettings();

    if (!settings) {
        throw new FailFetchSettings();
    }

    if (!settings.accounts) {
        throw new NoAccountSet();
    }

    const result = await Promise.all(
        settings.accounts.map(async (account) => {
            return { accountId: account.address, data: await getLatestDataFromGitLab({ account }) };
        })
    );

    const mrReceivedDetails = result.flatMap((r) => r.data.mrReceivedDetails);
    const mrToReview = result.reduce((acc, r) => acc + r.data.mrToReview, 0);
    const mrGivenDetailsNoDraft = result.flatMap((r) => r.data.mrGivenDetailsNoDraft);
    const mrReviewed = result.reduce((acc, r) => acc + r.data.mrReviewed, 0);
    const myDrafts = result.flatMap((r) => r.data.myDrafts);
    const issues = result.flatMap((r) => r.data.issues);
    const todos = result.flatMap((r) => r.data.todos);

    /** Save the fetched data */

    const lastUpdateDateUnix = new Date().getTime();

    await new Storage().setKeys({
        mrReceived: mrReceivedDetails,
        mrToReview,
        mrGiven: mrGivenDetailsNoDraft,
        mrReviewed,
        myDrafts,
        issues,
        todos,
        lastUpdateDateUnix
    });

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

    await setBadge(badgeText.length > 0 ? badgeText.join('⋅') : '', badgeColor);
};

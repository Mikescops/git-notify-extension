import { FailFetchSettings, GitLabNoAccount } from '../common/errors';
import { setBadge } from '../common/utils/setBadge';
import { getLatestDataFromGitLab } from './endpoints/getLatestDataFromGitLab';
import { getOrCreateAccountStorage, getConfiguration } from '../common/storage/index.js';
import { logger } from '../common/logger';

interface RoutineParams {
    accountUuids?: string[];
}

interface RoutineResult {
    collectedErrors: {
        uuid: string;
        errors: Error[];
    }[];
}

export const routine = async (params: RoutineParams): Promise<RoutineResult> => {
    logger('POLLING GITLAB API');

    const { accountUuids } = params;

    const settings = await getConfiguration(['accounts', 'alertBadgeCounters']);

    if (!settings) {
        throw new FailFetchSettings();
    }

    if (!settings.accounts || settings.accounts.length === 0) {
        throw new GitLabNoAccount();
    }

    const result = await Promise.all(
        settings.accounts
            .filter((account) => !accountUuids || accountUuids.includes(account.uuid))
            .map(async (account) => {
                const data = await getLatestDataFromGitLab({ account });
                return { accountUuid: account.uuid, data };
            })
    );

    const lastUpdateDateUnix = new Date().getTime();

    // Save fetched data into each account's localforage storage
    await Promise.all(
        result.map(async ({ accountUuid, data }) => {
            const accountStorage = getOrCreateAccountStorage(accountUuid);
            await accountStorage.setItem('mrReviewed', data.mrReviewed);
            await accountStorage.setItem('mrToReview', data.mrToReview);
            await accountStorage.setItem('mrReceived', data.mrReceivedDetails);
            await accountStorage.setItem('mrGiven', data.mrGivenDetailsNoDraft);
            await accountStorage.setItem('myDrafts', data.myDrafts);
            await accountStorage.setItem('issues', data.issues);
            await accountStorage.setItem('todos', data.todos);
            await accountStorage.setItem('lastUpdateDateUnix', lastUpdateDateUnix);
            await accountStorage.setItem('error', data.error);
        })
    );

    // Consolidate data for badge updates
    const mrToReview = result.reduce((acc, r) => acc + r.data.mrToReview, 0);
    const mrReviewed = result.reduce((acc, r) => acc + r.data.mrReviewed, 0);
    const issues = result.flatMap((r) => (!(r.data.issues instanceof Error) ? r.data.issues : []));
    const todos = result.flatMap((r) => (!(r.data.todos instanceof Error) ? r.data.todos : []));

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

    return {
        collectedErrors: result
            .map((r) => {
                const collectedErrors = [];
                if (r.data.error) {
                    collectedErrors.push(r.data.error);
                }
                if (r.data.mrReceivedDetails instanceof Error) {
                    collectedErrors.push(r.data.mrReceivedDetails);
                }
                if (r.data.mrGivenDetailsNoDraft instanceof Error) {
                    collectedErrors.push(r.data.mrGivenDetailsNoDraft);
                }
                if (r.data.myDrafts instanceof Error) {
                    collectedErrors.push(r.data.myDrafts);
                }
                if (r.data.issues instanceof Error) {
                    collectedErrors.push(r.data.issues);
                }
                if (r.data.todos instanceof Error) {
                    collectedErrors.push(r.data.todos);
                }

                if (collectedErrors.length === 0) {
                    return null;
                }

                return {
                    uuid: r.accountUuid,
                    errors: collectedErrors
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null)
    };
};

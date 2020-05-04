import * as async from 'async';
import { browser } from 'webextension-polyfill-ts';
import { Gitlab } from 'gitlab'; // All Resources
import { getSettings } from './utils/getSettings';
import { fetchMRExtraInfo } from './utils/fetchMRExtraInfo';
import { MergeRequests, GetSettingsResponse, ReviewRequests, ReviewGiven, StoredData, ReviewChanges } from './types';

let ERROR_TRACKER: Error | null;

const pollMR = (cb: Callback<boolean>) => {
    interface AsyncResults {
        getSettings: GetSettingsResponse;
        gitlabApi: Gitlab;
        reviewRequests: ReviewRequests;
        givenRequests: ReviewGiven;
        getStoredData: StoredData;
        computeChanges: ReviewChanges;
        saveLocalStorage: void;
    }

    async.auto<AsyncResults>(
        {
            getSettings: (cb) => getSettings(cb),
            gitlabApi: [
                'getSettings',
                (results, cb) => {
                    console.log('>> POLLING GITLAB API');

                    if (!results.getSettings) {
                        browser.browserAction.setBadgeText({
                            text: ''
                        });

                        return cb(new Error('Fail fetching settings.'));
                    }

                    if (!results.getSettings.token) {
                        return cb(new Error('No Gitlab token set, visit options.'));
                    }
                    if (!results.getSettings.address) {
                        return cb(new Error('No Gitlab host address set, visit options.'));
                    }

                    const api = new Gitlab({
                        host: results.getSettings.address,
                        token: results.getSettings.token
                    });

                    return cb(null, api);
                }
            ],
            reviewRequests: [
                'gitlabApi',
                (results, cb) => {
                    const { gitlabApi } = results;

                    gitlabApi.MergeRequests.all({
                        state: 'opened',
                        scope: 'assigned_to_me',
                        wip: 'no'
                    })
                        .then((response) => {
                            const mrAssignedList = response as MergeRequests[];
                            return fetchMRExtraInfo(gitlabApi, mrAssignedList, (error, mrAssignedDetails) => {
                                if (error) {
                                    return cb(error);
                                }

                                if (!mrAssignedDetails) {
                                    return cb(new Error('Could not fetch merge requests assigned.'));
                                }

                                let mrToReview = 0;
                                mrAssignedDetails.forEach((mr) => {
                                    if (!mr.approvals.user_has_approved) {
                                        mrToReview += 1;
                                    }
                                });

                                browser.browserAction.setBadgeText({
                                    text: mrToReview === 0 ? '' : mrToReview.toString()
                                });

                                return cb(null, {
                                    mrAssigned: mrAssignedDetails,
                                    mrToReview
                                });
                            });
                        })
                        .catch((error: Error) => {
                            if (error) {
                                return cb(error);
                            }
                        });
                }
            ],
            givenRequests: [
                'gitlabApi',
                (results, cb) => {
                    const { gitlabApi } = results;

                    gitlabApi.MergeRequests.all({
                        state: 'opened',
                        scope: 'created_by_me'
                    })
                        .then((response) => {
                            const mrGivenList = response as MergeRequests[];
                            return fetchMRExtraInfo(gitlabApi, mrGivenList, (error, mrGivenDetails) => {
                                if (error) {
                                    return cb(error);
                                }

                                if (!mrGivenDetails) {
                                    return cb(new Error('Could not fetch merge requests given.'));
                                }

                                let mrReviewed = 0;
                                mrGivenDetails.forEach((mr) => {
                                    if (mr.approvals.approved) {
                                        mrReviewed += 1;
                                    }
                                });

                                return cb(null, {
                                    mrGiven: mrGivenDetails,
                                    mrReviewed
                                });
                            });
                        })
                        .catch((error: Error) => {
                            if (error) {
                                return cb(error);
                            }
                        });
                }
            ],
            getStoredData: [
                'reviewRequests',
                'givenRequests',
                (_results, cb) => {
                    browser.storage.local
                        .get(['mrAssigned', 'mrGiven', 'mrToReview', 'mrReviewed', 'reviewChanges'])
                        .then((data) => cb(null, data as StoredData))
                        .catch((error) => cb(error));
                }
            ],
            computeChanges: [
                'reviewRequests',
                'givenRequests',
                'getStoredData',
                (results, cb) => {
                    /** Get all comments (stored and received) */
                    const storedCommentsAssigned = results.getStoredData.mrAssigned.flatMap((mr) => mr.comments);
                    const storedCommentsGiven = results.getStoredData.mrGiven.flatMap((mr) => mr.comments);

                    const receivedCommentsAssigned = results.reviewRequests.mrAssigned.flatMap((mr) => mr.comments);
                    const receivedCommentsGiven = results.givenRequests.mrGiven.flatMap((mr) => mr.comments);

                    /** Filter only new comments */
                    const newCommentsAssigned = receivedCommentsAssigned
                        .filter((comment) => !storedCommentsAssigned.some((y) => comment.id === y.id))
                        .concat(results.getStoredData.reviewChanges?.newCommentsAssigned);

                    const newCommentsGiven = receivedCommentsGiven
                        .filter((comment) => !storedCommentsGiven.some((y) => comment.id === y.id))
                        .concat(results.getStoredData.reviewChanges?.newCommentsGiven);

                    /** Filter only new comments tagging user */
                    const ownerName = 'username'; // to be changed
                    const PATTERN = new RegExp(`@${ownerName}`);
                    const receivedCommentsAssignedTagged = receivedCommentsAssigned.filter((comment) =>
                        PATTERN.test(comment.body)
                    );
                    const newCommentsGivenTagged = newCommentsGiven.filter((comment) => PATTERN.test(comment.body));

                    console.log(receivedCommentsAssignedTagged, newCommentsGivenTagged);

                    /** Prepare notification (?) */
                    // TBD

                    /** Send result */
                    const computedChanges = {
                        newCommentsAssigned,
                        newCommentsGiven,
                        notifications: []
                    };

                    // console.log(computedChanges);

                    return cb(null, computedChanges);
                }
            ],
            saveLocalStorage: [
                'reviewRequests',
                'givenRequests',
                'computeChanges',
                (results, cb) => {
                    const { mrAssigned, mrToReview } = results.reviewRequests;
                    const { mrGiven, mrReviewed } = results.givenRequests;
                    const reviewChanges = results.computeChanges;
                    const lastUpdateDateUnix = new Date().getTime();

                    browser.storage.local
                        .set({
                            mrAssigned,
                            mrToReview,
                            mrGiven,
                            mrReviewed,
                            reviewChanges,
                            lastUpdateDateUnix
                        })
                        .then(() => cb())
                        .catch((error) => cb(error));
                }
            ]
        },
        (error) => {
            if (error) {
                ERROR_TRACKER = error;
                console.error('POLL API', error);
                return cb(error, false);
            }

            ERROR_TRACKER = null;
            return cb(null, true);
        }
    );
};

console.log('background script loaded');
pollMR(() => null);
setInterval(function run() {
    pollMR(() => null);
}, 30000);

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'getMRs') {
        if (ERROR_TRACKER) {
            return Promise.resolve({ error: ERROR_TRACKER.message });
        }

        return Promise.resolve(
            browser.storage.local.get([
                'mrAssigned',
                'mrGiven',
                'mrToReview',
                'mrReviewed',
                'reviewChanges',
                'lastUpdateDateUnix'
            ])
        );
    }

    if (message.type === 'pollMR') {
        return new Promise((resolve) => pollMR((_error, result) => resolve(result)));
    }
});

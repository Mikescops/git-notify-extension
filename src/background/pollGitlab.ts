import * as async from 'async';
import { browser } from 'webextension-polyfill-ts';
import { Gitlab } from '@gitbeaker/browser';
import { getSettings } from './utils/getSettings';
import { fetchMRExtraInfo } from './utils/fetchMRExtraInfo';
import { MergeRequests, GetSettingsResponse, MergeRequestsDetails, Todo, GitlabAPI, Issue } from './types';
import { setBadge } from './utils/setBadge';

export const pollGitlab = (cb: Callback<boolean>) => {
    interface ReviewRequests {
        mrAssigned: MergeRequestsDetails[];
        mrToReview: number;
    }

    interface ReviewGiven {
        mrGiven: MergeRequestsDetails[];
        mrReviewed: number;
    }

    interface AsyncResults {
        getSettings: GetSettingsResponse;
        gitlabApi: GitlabAPI;
        reviewRequests: ReviewRequests;
        givenRequests: ReviewGiven;
        issuesAssigned: Issue[];
        todos: Todo[];
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
                        return cb(new Error('Fail fetching settings.'));
                    }

                    if (!results.getSettings.token) {
                        return cb(new Error('No GitLab token set, visit options.'));
                    }
                    if (!results.getSettings.address) {
                        return cb(new Error('No GitLab host address set, visit options.'));
                    }

                    const api = new Gitlab({
                        host: results.getSettings.address,
                        token: results.getSettings.token
                    });

                    return cb(null, api);
                }
            ],
            reviewRequests: [
                'getSettings',
                'gitlabApi',
                (results, cb) => {
                    const { gitlabApi, getSettings } = results;

                    gitlabApi.MergeRequests.all({
                        state: 'opened',
                        scope: 'assigned_to_me',
                        wip: 'no'
                    })
                        .then((response: MergeRequests[]) => {
                            return fetchMRExtraInfo(
                                {
                                    gitlabApi,
                                    mrList: response,
                                    gitlabCE: getSettings.gitlabCE
                                },
                                (error, mrAssignedDetails) => {
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

                                    setBadge(mrToReview === 0 ? '' : mrToReview.toString(), 'blue');

                                    return cb(null, {
                                        mrAssigned: mrAssignedDetails,
                                        mrToReview
                                    });
                                }
                            );
                        })
                        .catch((error: Error) => {
                            if (error) {
                                return cb(error);
                            }
                        });
                }
            ],
            givenRequests: [
                'getSettings',
                'gitlabApi',
                (results, cb) => {
                    const { gitlabApi, getSettings } = results;

                    gitlabApi.MergeRequests.all({
                        state: 'opened',
                        scope: 'created_by_me'
                    })
                        .then((response: MergeRequests[]) => {
                            return fetchMRExtraInfo(
                                {
                                    gitlabApi,
                                    mrList: response,
                                    gitlabCE: getSettings.gitlabCE
                                },
                                (error, mrGivenDetails) => {
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
                                }
                            );
                        })
                        .catch((error: Error) => {
                            if (error) {
                                return cb(error);
                            }
                        });
                }
            ],
            issuesAssigned: [
                'gitlabApi',
                (results, cb) => {
                    const { gitlabApi } = results;

                    gitlabApi.Issues.all({
                        state: 'opened',
                        scope: 'assigned_to_me'
                    })
                        .then((response: Issue[]) => {
                            return cb(null, response);
                        })
                        .catch((error: Error) => {
                            if (error) {
                                return cb(error);
                            }
                        });
                }
            ],
            todos: [
                'gitlabApi',
                (results, cb) => {
                    const { gitlabApi } = results;

                    gitlabApi.Todos.all({
                        state: 'pending'
                    })
                        .then((response: Todo[]) => {
                            return cb(null, response);
                        })
                        .catch((error: Error) => {
                            if (error) {
                                return cb(error);
                            }
                        });
                }
            ],
            saveLocalStorage: [
                'reviewRequests',
                'givenRequests',
                'todos',
                (results, cb) => {
                    const { mrAssigned, mrToReview } = results.reviewRequests;
                    const { mrGiven, mrReviewed } = results.givenRequests;
                    const { todos, issuesAssigned } = results;
                    const lastUpdateDateUnix = new Date().getTime();

                    browser.storage.local
                        .set({
                            mrAssigned,
                            mrToReview,
                            mrGiven,
                            mrReviewed,
                            issuesAssigned,
                            todos,
                            lastUpdateDateUnix
                        })
                        .then(() => cb())
                        .catch((error) => cb(error));
                }
            ]
        },
        (error) => {
            if (error) {
                console.error('POLL API', error);
                setBadge('Error', 'red');
                return cb(error, false);
            }
            return cb(null, true);
        }
    );
};

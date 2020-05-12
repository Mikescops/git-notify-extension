import * as async from 'async';
import { MergeRequestsDetails, MergeRequests, Comment, Approvals, GitlabAPI } from '../types';

interface FetchMRExtraInfoParams {
    gitlabCE: boolean;
    gitlabApi: GitlabAPI;
    mrList: MergeRequests[];
}

export const fetchMRExtraInfo = (params: FetchMRExtraInfoParams, cb: Callback<MergeRequestsDetails[]>) => {
    const { gitlabApi, mrList, gitlabCE } = params;
    const mrAssignedWithDetails: MergeRequestsDetails[] = [];

    async.forEach(
        mrList,
        (mr, cb) => {
            interface AsyncResults {
                approvals: Approvals;
                comments: Comment[];
            }

            async.auto<AsyncResults>(
                {
                    approvals: (cb) => {
                        if (gitlabCE === true) {
                            const alternateResponse = {
                                // eslint-disable-next-line @typescript-eslint/camelcase
                                user_has_approved: false,
                                approved: false,
                                // eslint-disable-next-line @typescript-eslint/camelcase
                                approved_by: []
                            };

                            return cb(null, alternateResponse);
                        }

                        gitlabApi.MergeRequests.approvals(mr.project_id, {
                            mergerequestIId: mr.iid
                        })
                            .then((response: Approvals) => {
                                const details = response;
                                return cb(null, details);
                            })
                            .catch((error: Error) => {
                                if (error) {
                                    return cb(
                                        new Error(
                                            `You are likely using GitLab CE.
                                            Please check the box in the options.`
                                        )
                                    );
                                }
                            });
                    },
                    comments: (cb) =>
                        gitlabApi.MergeRequestNotes.all(mr.project_id, mr.iid)
                            .then((response: Comment[]) => {
                                const notes: Comment[] = response;
                                const comments = notes.filter((note) => note.system === false);

                                return cb(null, comments);
                            })
                            .catch((error: Error) => {
                                if (error) {
                                    return cb(error);
                                }
                            })
                },
                (error, results) => {
                    if (error) {
                        return cb(error);
                    }

                    if (!results) {
                        return cb(new Error(`Cannot fetch merge requests details for mr id: ${mr.id}`));
                    }

                    mrAssignedWithDetails.push({
                        ...mr,
                        approvals: results.approvals,
                        comments: results.comments
                    });

                    return cb();
                }
            );
        },
        (error) => {
            if (error) {
                return cb(error);
            }
            const mrAssignedSorted = mrAssignedWithDetails.sort((a, b) => {
                return Number(a.approvals.user_has_approved) - Number(b.approvals.user_has_approved);
            });

            return cb(null, mrAssignedSorted);
        }
    );
};

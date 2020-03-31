import * as async from 'async';
import { Gitlab } from 'gitlab';
import { MergeRequestsDetails, MergeRequests, Comment, Approvals } from '../types';

export const fetchMRExtraInfo = (
    gitlabApi: Gitlab,
    mrAssignedList: MergeRequests[],
    cb: Callback<MergeRequestsDetails[]>
) => {
    const mrAssignedWithDetails: MergeRequestsDetails[] = [];

    async.forEach(
        mrAssignedList,
        (mr, cb) => {
            interface AsyncResults {
                approvals: Approvals;
                comments: Comment[];
            }

            async.auto<AsyncResults>(
                {
                    approvals: (cb) =>
                        gitlabApi.MergeRequests.approvals(mr.project_id, {
                            mergerequestIId: mr.iid
                        })
                            .then((response) => {
                                const details = response as Approvals;
                                return cb(null, details);
                            })
                            .catch((error) => {
                                if (error) {
                                    return cb(error);
                                }
                            }),
                    comments: (cb) =>
                        gitlabApi.MergeRequestNotes.all(mr.project_id, mr.iid)
                            .then((response) => {
                                const notes: Comment[] = response as Comment[];
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

import * as async from 'async';
import { MergeRequestsDetails, MergeRequests, Approvals, GitlabAPI } from '../types';

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
            if (gitlabCE === true) {
                const alternateResponse = {
                    user_has_approved: false,
                    approved: false,
                    approved_by: []
                };

                mrAssignedWithDetails.push({
                    ...mr,
                    approvals: alternateResponse
                });

                return cb();
            }

            gitlabApi.MergeRequestApprovals.approvals(mr.project_id, {
                mergerequestIid: mr.iid
            })
                .then((response: Approvals) => {
                    const details = response;
                    mrAssignedWithDetails.push({
                        ...mr,
                        approvals: details
                    });
                    return cb();
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
        (error) => {
            if (error) {
                return cb(error);
            }
            const mrAssignedSorted = mrAssignedWithDetails
                .sort((a, b) => (a.created_at < b.created_at ? 1 : 0))
                .sort((a, b) => Number(a.approvals.user_has_approved) - Number(b.approvals.user_has_approved));
            return cb(null, mrAssignedSorted);
        }
    );
};

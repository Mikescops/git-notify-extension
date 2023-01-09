import { GitLabIsCE } from '../errors';
import { MergeRequestsDetails, GitlabAPI, GitlabTypes } from '../types';

interface FetchMRExtraInfoParams {
    gitlabCE: boolean;
    gitlabApi: GitlabAPI;
    mrList: GitlabTypes.MergeRequestSchema[];
}

export const fetchMRExtraInfo = async (params: FetchMRExtraInfoParams): Promise<MergeRequestsDetails[]> => {
    const { gitlabApi, mrList, gitlabCE } = params;

    if (mrList.length < 1) {
        return Promise.resolve([]);
    }

    const requestsToExecute = mrList.map((mr) => {
        if (gitlabCE === true) {
            return Promise.resolve({
                iid: mr.iid,
                user_has_approved: false,
                approved: false,
                approved_by: []
            });
        }

        return gitlabApi.MergeRequestApprovals.configuration(mr.project_id, {
            mergerequestIid: mr.iid
        });
    });

    const approvalsPerMr = await Promise.all(requestsToExecute);

    const mrWithDetails: MergeRequestsDetails[] = approvalsPerMr.map((approvals) => {
        if (approvals instanceof Error) {
            throw new GitLabIsCE();
        }

        return {
            ...mrList[mrList.findIndex((mr) => mr.iid === approvals.iid)],
            approvals
        };
    });

    return mrWithDetails
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .sort((a, b) => {
            if (a.approvals.user_has_approved === b.approvals.user_has_approved) {
                return 0;
            }
            if (a.approvals.user_has_approved) {
                return 1;
            }
            if (b.approvals.user_has_approved) {
                return -1;
            }
            return 0;
        });
};

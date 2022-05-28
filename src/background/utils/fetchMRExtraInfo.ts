import { GitLabIsCE } from '../errors';
import { MergeRequestsDetails, GitlabAPI, GitlabTypes } from '../types';

interface FetchMRExtraInfoParams {
    gitlabCE: boolean;
    gitlabApi: GitlabAPI;
    mrList: GitlabTypes.MergeRequestSchema[];
}

export const fetchMRExtraInfo = async (params: FetchMRExtraInfoParams): Promise<MergeRequestsDetails[]> => {
    const { gitlabApi, mrList, gitlabCE } = params;
    const mrWithDetails: MergeRequestsDetails[] = [];

    if (mrList.length < 1) {
        return Promise.resolve(mrWithDetails);
    }

    for (const mr of mrList) {
        if (gitlabCE === true) {
            const alternateResponse = {
                user_has_approved: false,
                approved: false,
                approved_by: []
            };

            mrWithDetails.push({
                ...mr,
                approvals: alternateResponse
            });

            continue;
        }

        const approvals = await gitlabApi.MergeRequestApprovals.configuration(mr.project_id, {
            mergerequestIid: mr.iid
        });
        if (approvals instanceof Error) {
            throw new GitLabIsCE();
        }
        mrWithDetails.push({
            ...mr,
            approvals
        });
    }

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

import {
    ExpandedMergeRequestSchema,
    MergeRequestLevelMergeRequestApprovalSchema,
    MergeRequestSchemaWithBasicLabels
} from '@gitbeaker/rest';
import { GitLabIsCE } from '../../common/errors';
import { GitlabAPI, MergeRequestsDetails } from '../../common/types';

interface FetchMRExtraInfoParams {
    gitlabCE: boolean;
    gitlabApi: GitlabAPI;
    mrList: MergeRequestSchemaWithBasicLabels[];
}

export const fetchMRExtraInfo = async (params: FetchMRExtraInfoParams): Promise<MergeRequestsDetails[]> => {
    const { gitlabApi, mrList, gitlabCE } = params;

    if (mrList.length < 1) {
        return Promise.resolve([]);
    }

    const requestsToExecute = mrList.map((mr) => {
        const mrDetailsRequest = gitlabApi.MergeRequests.show(
            mr.project_id,
            mr.iid
        ) as Promise<ExpandedMergeRequestSchema>;

        if (gitlabCE === true) {
            return Promise.all([
                mrDetailsRequest,
                Promise.resolve({
                    iid: mr.iid,
                    user_has_approved: false,
                    approved: false,
                    approved_by: []
                })
            ]);
        }

        return Promise.all([
            mrDetailsRequest,
            gitlabApi.MergeRequestApprovals.showConfiguration(mr.project_id, {
                mergerequestIId: mr.iid
            }) as Promise<MergeRequestLevelMergeRequestApprovalSchema>
        ]);
    });

    const mrDetails = await Promise.all(requestsToExecute);

    const mrWithDetails = mrDetails.map((mr) => {
        const mrDetails = mr[0];
        const approvals = mr[1];

        if (approvals instanceof Error) {
            throw new GitLabIsCE();
        }

        return {
            ...mrDetails,
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

import { Gitlab, Types as GitlabTypes } from '@gitbeaker/browser';
export { Types as GitlabTypes } from '@gitbeaker/browser';

export type GitlabAPI = InstanceType<typeof Gitlab>;

export interface MergeRequestsDetails extends GitlabTypes.MergeRequestSchema {
    approvals: Approvals | GitlabTypes.MergeRequestLevelMergeRequestApprovalSchema;
}

export interface Approvals {
    user_has_approved: boolean;
    approved: boolean;
    approved_by: GitlabTypes.ApprovedByEntity[];
    // missing types here
}

export interface GetSettingsResponse {
    gitlabCE: boolean;
    token: string;
    address: string;
    alertBadgeCounters: number[];
}

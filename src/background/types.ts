import {
    Gitlab,
    ExpandedMergeRequestSchema,
    MergeRequestLevelMergeRequestApprovalSchema,
    ApprovedByEntity,
    UserSchema
} from '@gitbeaker/rest';
import { Account } from '../common/types';

export type GitlabAPI = InstanceType<typeof Gitlab>;

export interface MergeRequestsDetails extends ExpandedMergeRequestSchema {
    approvals: Approvals | MergeRequestLevelMergeRequestApprovalSchema;
}

export interface Approvals {
    user_has_approved: boolean;
    approved: boolean;
    approved_by: ApprovedByEntity[];
    // missing types here
}

export interface GetSettingsResponse {
    accounts: Account[];
    alertBadgeCounters: number[];
}

export interface GroupMember extends UserSchema {
    mergeRequestsCount: number;
}

import {
    Gitlab,
    ExpandedMergeRequestSchema,
    MergeRequestLevelMergeRequestApprovalSchema,
    ApprovedByEntity,
    UserSchema
} from '@gitbeaker/rest';

export type GitlabAPI = InstanceType<typeof Gitlab>;

export type ErrorKeys = 'mrReceived' | 'mrGiven' | 'myDrafts' | 'issues' | 'todos' | 'general';

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

export type TabId = 'to_review' | 'under_review' | 'issues' | 'todo_list' | 'pick' | 'drafts';

export interface Configuration {
    mode: 'production' | 'development';
    defaultTab: TabId;
    accounts: Account[];
    alertBadgeCounters: number[];
    refreshRate: number;
}

export interface Account {
    uuid: string;
    gitlabCE: boolean;
    token: string;
    address: string;
    draftInToReviewTab: boolean;
    projectDirectoryPrefix: string;
}

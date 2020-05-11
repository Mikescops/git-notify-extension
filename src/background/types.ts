export interface MergeRequests {
    id: number;
    iid: number;
    title: string;
    description: string;
    project_id: number;
    created_at: number;
    source_branch: string;
    merge_status: string;
    web_url: string;
    author: User;
    assignees: User[];
    user_notes_count: number;
    // missing types here
}

export interface MergeRequestsDetails extends MergeRequests {
    approvals: Approvals;
    comments: Comment[];
    // missing types here
}

export interface Approvals {
    user_has_approved: boolean;
    approved: boolean;
    approved_by: Assignee[];
    // missing types here
}

export interface Assignee {
    user: User;
}

export interface User {
    id: number;
    name: string;
    avatar_url: string;
}

export interface Comment {
    system: boolean;
}

export interface GetSettingsResponse {
    token: string;
    address: string;
}

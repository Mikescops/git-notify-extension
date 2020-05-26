export type GitlabAPI = any;

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
    references: References;
    // missing types here
}

export interface MergeRequestsDetails extends MergeRequests {
    approvals: Approvals;
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
    // missing types here
}

export interface References {
    short: string;
    relative: string;
    full: string;
}

export interface Issue {
    id: number;
    iid: number;
    title: string;
    description: string;
    web_url: string;
    created_at: string;
    updated_at: string;
    author: User;
    user_notes_count: number;
    assignees: User[];
    references: References;
    // missing types here
}

export interface Todo {
    id: number;
    author: User;
    action_name: string;
    target_url: string;
    target: TodoTarget;
    body: string;
    created_at: string;
    updated_at: string;
    state: string;
    // missing types here
}

export interface TodoTarget {
    id: number;
    iid: number;
    title: string;
    author: User;
    // missing types here
}

export interface GetSettingsResponse {
    gitlabCE: boolean;
    token: string;
    address: string;
}

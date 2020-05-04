export interface MergeRequests {
    id: number;
    iid: number;
    title: string;
    description: string;
    project_id: number;
    created_at: string;
    source_branch: string;
    merge_status: string;
    web_url: string;
    author: User;
    assignees: User[];
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
    id: number;
    created_at: string;
    updated_at: string;
    system: boolean;
    author: User;
    body: string;
    noteable_id: number;
    noteable_idd: number;
    // missing types here
}

export interface Notification {
    content: string;
}

export interface GetSettingsResponse {
    token: string;
    address: string;
}

export interface ReviewRequests {
    mrAssigned: MergeRequestsDetails[];
    mrToReview: number;
}

export interface ReviewGiven {
    mrGiven: MergeRequestsDetails[];
    mrReviewed: number;
}

export interface ReviewChanges {
    newCommentsAssigned: Comment[];
    newCommentsGiven: Comment[];
    notifications: Notification[];
}

export interface StoredData extends ReviewRequests, ReviewGiven {
    reviewChanges: ReviewChanges;
}

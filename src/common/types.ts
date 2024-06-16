export type TabId = 'to_review' | 'under_review' | 'issues' | 'todo_list' | 'pick' | 'drafts';

export interface Configuration {
    mode: 'production' | 'development';
    defaultTab: TabId;
    accounts: Account[];
    alertBadgeCounters: number[];
    refreshRate: number;
}

export interface Account {
    gitlabCE: boolean;
    token: string;
    address: string;
    draftInToReviewTab: boolean;
    projectDirectoryPrefix: string;
}

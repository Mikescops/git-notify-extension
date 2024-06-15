import { Configuration } from '../common/types';

export const config = {
    mode: 'production',
    defaultTab: 'to_review',
    alertBadgeCounters: [0],
    accounts: [
        {
            gitlabCE: false,
            token: '',
            address: 'https://gitlab.com',
            draftInToReviewTab: true,
            projectDirectoryPrefix: ''
        }
    ]
} satisfies Configuration;

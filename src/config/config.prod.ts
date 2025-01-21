import { Configuration } from '../common/types';

export const config = {
    mode: 'production',
    defaultTab: 'to_review',
    alertBadgeCounters: [0],
    accounts: [
        /* {
            uuid: globalThis.crypto.randomUUID(),
            gitlabCE: false,
            token: '',
            address: '',
            draftInToReviewTab: true,
            projectDirectoryPrefix: ''
        } */
    ],
    refreshRate: 60
} satisfies Configuration;

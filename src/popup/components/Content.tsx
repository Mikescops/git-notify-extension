import { TabId } from '../../common/types';
import { AppStatus } from '../types';
import { MergeRequestSendMessageReply } from '../utils/mergeRequestDownloader';

import { PickReviewer } from '../pages/PickReviewer';
import { Todos } from '../pages/Todos';
import { Issues } from '../pages/Issues';
import { ErrorFlash } from './ErrorFlash';
import { MergeRequests } from '../pages/MergeRequests';
import { Loading } from './Loading';
import { GlobalError } from '../../common/errors';
import { Onboarding } from '../pages/Onboarding';

interface Props {
    appStatus: AppStatus;
    mrData: MergeRequestSendMessageReply;
    currentTab: TabId;
    error?: GlobalError;
}

export const Content = (props: Props) => {
    const { appStatus, mrData, currentTab, error } = props;

    if (appStatus === 'loading' || appStatus === 'idle') {
        return <Loading />;
    }

    if (appStatus === 'error' && error) {
        if (error.name === 'GitLabTokenNotSet' || error.name === 'GitLabAddressNotSet') {
            return <Onboarding />;
        }

        return <ErrorFlash error={error} />;
    }

    if (currentTab === 'issues') {
        return <Issues issues={mrData.issues} />;
    }

    if (currentTab === 'todo_list') {
        return <Todos todos={mrData.todos} />;
    }

    if (currentTab === 'pick') {
        return <PickReviewer />;
    }

    const mrToDisplayByTabId = {
        to_review: mrData.mrReceived,
        under_review: mrData.mrGiven,
        drafts: mrData.myDrafts
    };

    const mergeRequestsToDisplay = mrToDisplayByTabId[currentTab] ?? mrData.mrReceived;
    return <MergeRequests mergeRequests={mergeRequestsToDisplay} />;
};

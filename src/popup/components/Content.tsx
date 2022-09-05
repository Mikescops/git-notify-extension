import React from 'react';
import { Flash } from '@primer/react';

import { TabId } from '../../common/types';
import { AppStatus } from '../types';
import { MergeRequestSendMessageReply } from '../utils/mergeRequestDownloader';

import { PickReviewer } from '../pages/PickReviewer';
import { Todos } from '../pages/Todos';
import { Issues } from '../pages/Issues';
import { ErrorFlash } from './ErrorFlash';
import { MergeRequests } from '../pages/MergeRequests';

interface Props {
    appStatus: AppStatus;
    mrData: MergeRequestSendMessageReply;
    currentTab: TabId;
    errorMessage: string;
    errorStack: string;
}

export const Content = (props: Props) => {
    const { appStatus, mrData, currentTab, errorMessage, errorStack } = props;

    if (appStatus === 'loading' || appStatus === 'idle') {
        return <Flash>Fetching content...</Flash>;
    }

    if (appStatus === 'error') {
        return <ErrorFlash message={errorMessage} stack={errorStack} />;
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

import React from 'react';
import { Flash } from '@primer/react';

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
    currentTab: number;
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

    if (currentTab === 2) {
        return <Issues issues={mrData.issuesAssigned} />;
    }

    if (currentTab === 3) {
        return <Todos todos={mrData.todos} />;
    }

    if (currentTab === 4) {
        return <PickReviewer />;
    }

    const mergeRequestsToDisplay = currentTab === 0 ? mrData.mrReceived : mrData.mrGiven;
    return <MergeRequests mergeRequests={mergeRequestsToDisplay} />;
};

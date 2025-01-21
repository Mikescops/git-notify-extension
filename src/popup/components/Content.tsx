import { useCallback, useEffect, useState } from 'react';
import { ErrorKeys, TabId } from '../../common/types';
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
import { getConfiguration } from '../../common/storage';

interface Props {
    appStatus: AppStatus;
    mrData: MergeRequestSendMessageReply;
    currentTab: TabId;
    error?: GlobalError;
}

export const Content = (props: Props) => {
    const { appStatus, mrData, currentTab, error } = props;

    const [draftInToReviewTab, setDraftInToReviewTab] = useState<boolean>(true);

    const displayErrorsForCurrentTab = () => {
        const mapTabToErrorKey: Record<Exclude<TabId, 'pick'>, ErrorKeys> = {
            to_review: 'mrReceived',
            under_review: 'mrGiven',
            drafts: 'myDrafts',
            issues: 'issues',
            todo_list: 'todos'
        };

        if (currentTab === 'pick') {
            return;
        }

        return mrData.errors.map((accountError) => {
            const localError = accountError.errors[mapTabToErrorKey[currentTab]];
            if (localError) {
                return <ErrorFlash key={accountError.uuid} accountUuid={accountError.uuid} error={localError} />;
            }
            if (accountError.errors.general) {
                return (
                    <ErrorFlash
                        key={accountError.uuid}
                        accountUuid={accountError.uuid}
                        error={accountError.errors.general}
                    />
                );
            }
        });
    };

    const contentSettings = useCallback(() => {
        const getSettings = getConfiguration(['accounts']);
        getSettings.then((settings) => {
            setDraftInToReviewTab(
                Boolean(settings.accounts.length > 0 ? settings.accounts[0].draftInToReviewTab : true)
            );
        });
    }, []);

    useEffect(() => contentSettings(), [contentSettings]);

    if (appStatus === 'loading' || appStatus === 'idle') {
        return <Loading />;
    }

    if (appStatus === 'error' && error) {
        if (
            error.name === 'GitLabTokenNotSet' ||
            error.name === 'GitLabAddressNotSet' ||
            error.name === 'GitLabNoAccount'
        ) {
            return <Onboarding />;
        }

        return <ErrorFlash error={error} />;
    }

    if (currentTab === 'issues') {
        return (
            <>
                {displayErrorsForCurrentTab()}
                <Issues issues={mrData.issues} />
            </>
        );
    }

    if (currentTab === 'todo_list') {
        return (
            <>
                {displayErrorsForCurrentTab()}
                <Todos todos={mrData.todos} />
            </>
        );
    }

    if (currentTab === 'pick') {
        return <PickReviewer />;
    }

    const mrToDisplayByTabId = {
        to_review: mrData.mrReceived,
        under_review: mrData.mrGiven,
        drafts: mrData.myDrafts
    };

    let mergeRequestsToDisplay = mrToDisplayByTabId[currentTab] ?? mrData.mrReceived;

    if (currentTab === 'to_review' && !draftInToReviewTab) {
        mergeRequestsToDisplay = mergeRequestsToDisplay?.filter((mr) => !mr.work_in_progress);
    }

    return (
        <>
            {displayErrorsForCurrentTab()}
            <MergeRequests mergeRequests={mergeRequestsToDisplay} />{' '}
        </>
    );
};

import React, { useCallback, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Flash, FilterList, Button } from '@primer/react';
import { CheckIcon } from '@primer/octicons-react';

import { GitlabTypes, MergeRequestsDetails } from '../../background/types';
import { AppStatus } from '../types';
import { MergeRequestSendMessageReply } from '../utils/mergeRequestDownloader';

import { EmptyItems } from './EmptyItems';
import { IssueItem } from './IssueItem';
import { MergeRequestItem } from './MergeRequestItem';
import { TodoItem } from './TodoItem';
import { PickReviewer } from './PickReviewer';

interface Props {
    appStatus: AppStatus;
    mrData: MergeRequestSendMessageReply;
    currentTab: number;
    errorMessage: string;
}

export const Content = (props: Props) => {
    const { appStatus, mrData, currentTab, errorMessage } = props;

    const [todosVisibility, setTodosVisibility] = useState(true);
    const setAllTodosAsDone = useCallback(() => {
        browser.runtime.sendMessage({ type: 'setTodoAsDone', todoId: null }).then((error) => {
            if (error) {
                return console.error(error);
            }
            setTodosVisibility(false);
        });
    }, []);

    if (appStatus === 'loading' || appStatus === 'idle') {
        return <Flash>Fetching content...</Flash>;
    }

    if (appStatus === 'error') {
        return (
            <Flash sx={{ margin: 2 }} variant="danger">
                {errorMessage}
            </Flash>
        );
    }

    if (currentTab === 2) {
        if (!mrData.issuesAssigned || mrData.issuesAssigned.length === 0) {
            return <EmptyItems />;
        }
        return (
            <FilterList className={'mrList'}>
                {mrData.issuesAssigned.map((issue: GitlabTypes.IssueSchema) => (
                    <IssueItem issue={issue} key={issue.id} />
                ))}
            </FilterList>
        );
    }

    if (currentTab === 3) {
        if (!mrData.todos || mrData.todos.length === 0 || !todosVisibility) {
            return <EmptyItems />;
        }
        return (
            <>
                {mrData.todos.length > 1 && todosVisibility ? (
                    <div className={'subNav'}>
                        <p className={'subNavText'}>{mrData.todos.length} tasks to complete</p>
                        <Button onClick={setAllTodosAsDone} variant="default">
                            <CheckIcon /> Mark all as done
                        </Button>
                    </div>
                ) : null}
                <FilterList className={'mrList'}>
                    {mrData.todos.map((todo: GitlabTypes.TodoSchema) => (
                        <TodoItem todo={todo} key={todo.id} />
                    ))}
                </FilterList>
            </>
        );
    }

    if (currentTab === 4) {
        return <PickReviewer />;
    }

    // show data
    let mrList: MergeRequestsDetails[] = [];
    if (currentTab === 0) {
        mrList = mrData.mrReceived;
    } else {
        mrList = mrData.mrGiven;
    }

    if (!mrList || mrList.length === 0) {
        return <EmptyItems />;
    }

    return (
        <FilterList className={'mrList'}>
            {mrList.map((mr: MergeRequestsDetails) => (
                <MergeRequestItem mr={mr} key={mr.id} />
            ))}
        </FilterList>
    );
};

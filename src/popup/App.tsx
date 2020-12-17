import { hot } from 'react-hot-loader';
import { browser } from 'webextension-polyfill-ts';
import React, { useState, useCallback, useEffect } from 'react';
import { Button, FilterList, Text, theme as primer, Flash } from '@primer/components';
import { ThemeProvider } from 'styled-components';
import { CheckIcon } from '@primer/octicons-react';
import { MergeRequestItem } from './components/MergeRequestItem';
import { IssueItem } from './components/IssueItem';
import { TodoItem } from './components/TodoItem';
import { EmptyItems } from './components/EmptyItems';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { MergeRequestsDetails, Todo, Issue } from '../background/types';
import { getMergeRequestList, MergeRequestSendMessageReply } from './utils/mergeRequestDownloader';
import { AppStatus } from './types';

import './style.css';

const App = () => {
    const [appStatus, setAppStatus] = useState<AppStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [mrData, setMrData] = useState<MergeRequestSendMessageReply>({
        mrAssigned: [],
        mrToReview: 0,
        mrGiven: [],
        mrReviewed: 0,
        issuesAssigned: [],
        todos: [],
        lastUpdateDateUnix: Date.now()
    });

    const [currentTab, setCurrentTab] = useState(0);
    const [gitlabAddress, setGitlabAddress] = useState('');
    const [todosVisibility, setTodosVisibility] = useState(true);

    const applySettings = useCallback(() => {
        const getSettings = browser.storage.local.get(['defaultTab', 'gitlabAddress']);
        getSettings.then((settings) => {
            setCurrentTab(settings.defaultTab ? settings.defaultTab : 0);
            setGitlabAddress(settings.gitlabAddress ? settings.gitlabAddress : 'https://gitlab.com');
        });
    }, []);

    const setAllTodosAsDone = useCallback(() => {
        browser.runtime.sendMessage({ type: 'setTodoAsDone', todoId: null }).then((error) => {
            if (error) {
                return console.error(error);
            }
            setTodosVisibility(false);
        });
    }, []);

    // useEffect vs useCallback
    // https://medium.com/@infinitypaul/reactjs-useeffect-usecallback-simplified-91e69fb0e7a3
    const fetchData = useCallback(() => {
        setAppStatus('loading');
        getMergeRequestList()
            .then((response) => {
                if (!response) {
                    setAppStatus('error');
                    setErrorMessage('Something went wrong');
                    return;
                }
                if (response.error && response.error !== '') {
                    setAppStatus('error');
                    setErrorMessage(response.error ? response.error : '');
                    return;
                }

                setMrData(response);
                setAppStatus('success');
            })
            .catch((error) => {
                setAppStatus('error');
                setErrorMessage('Something went wrong');
                console.error(error);
            });
    }, []);

    // call fetch data and apply settings at component mount
    useEffect(() => fetchData(), [fetchData]);
    useEffect(() => applySettings(), [applySettings]);

    const getContent = useCallback(() => {
        if (appStatus === 'loading' || appStatus === 'idle') {
            return <Text>Fetching content...</Text>;
        }

        if (appStatus === 'error') {
            return (
                <Flash m={2} variant="danger">
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
                    {mrData.issuesAssigned.map((issue: Issue) => (
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
                            <Button onClick={setAllTodosAsDone} variant={'small'}>
                                <CheckIcon /> Mark all as done
                            </Button>
                        </div>
                    ) : null}
                    <FilterList className={'mrList'}>
                        {mrData.todos.map((todo: Todo) => (
                            <TodoItem todo={todo} key={todo.id} />
                        ))}
                    </FilterList>
                </>
            );
        }

        // show data
        let mrList: MergeRequestsDetails[] = [];
        if (currentTab === 0) {
            mrList = mrData.mrAssigned;
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
    }, [appStatus, mrData, currentTab, errorMessage, setAllTodosAsDone, todosVisibility]);

    return (
        <ThemeProvider theme={primer}>
            <div className={'container'}>
                <Nav currentTab={currentTab} setCurrentTab={setCurrentTab} mrData={mrData} />
                {getContent()}
                <Footer
                    currentTab={currentTab}
                    mrData={mrData}
                    appStatus={appStatus}
                    fetchData={fetchData}
                    gitlabAddress={gitlabAddress}
                />
            </div>
        </ThemeProvider>
    );
};

export default hot(module)(App);

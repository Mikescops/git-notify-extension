import { hot } from 'react-hot-loader';
import { browser } from 'webextension-polyfill-ts';
import React, { useState, useCallback, useEffect } from 'react';
import {
    Button,
    FilterList,
    Flex,
    Text,
    ProgressBar,
    TabNav,
    Label,
    theme as primer,
    Tooltip,
    Flash
} from '@primer/components';
import { ThemeProvider } from 'styled-components';
import Octicon, { Sync, Gear } from '@primer/octicons-react';
import { MergeRequest } from './components/MergeRequest';
import { IssueItem } from './components/IssueItem';
import { TodoItem } from './components/TodoItem';
import { MergeRequestsDetails, Todo, Issue } from '../background/types';
import { getHumanReadableDate } from './helpers';
import { getMergeRequestList, MergeRequestSendMessageReply } from './utils/mergeRequestDownloader';

import './style.css';
import emptyInbox from './assets/empty_inbox.svg';

type AppStatus = 'idle' | 'loading' | 'success' | 'error';

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

    const openSettings = useCallback(() => browser.runtime.openOptionsPage(), []);

    const applySettings = useCallback(() => {
        const getSettings = browser.storage.local.get(['defaultTab']);
        getSettings.then((settings) => {
            setCurrentTab(settings.defaultTab ? settings.defaultTab : 0);
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
        if (appStatus === 'idle') {
            return <Text>Fetching content...</Text>;
        }

        if (appStatus === 'loading') {
            return <Text>Fetching content...</Text>;
        }

        if (appStatus === 'error') {
            return (
                <Flash m={2} scheme="red">
                    {errorMessage}
                </Flash>
            );
        }

        if (currentTab === 2) {
            if (!mrData.issuesAssigned || mrData.issuesAssigned.length === 0) {
                return <img src={emptyInbox} className={'emptyInbox'} />;
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
            if (!mrData.todos || mrData.todos.length === 0) {
                return <img src={emptyInbox} className={'emptyInbox'} />;
            }
            return (
                <FilterList className={'mrList'}>
                    {mrData.todos.map((todo: Todo) => (
                        <TodoItem todo={todo} key={todo.id} />
                    ))}
                </FilterList>
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
            return <img src={emptyInbox} className={'emptyInbox'} />;
        }
        return (
            <FilterList className={'mrList'}>
                {mrList.map((mr: MergeRequestsDetails) => (
                    <MergeRequest mr={mr} key={mr.id} />
                ))}
            </FilterList>
        );
    }, [appStatus, mrData, currentTab, errorMessage]);

    const getMrRatio = useCallback(() => {
        if (appStatus !== 'success' || mrData === null) {
            return 100;
        }
        let mrList = [];
        if (currentTab === 0) {
            mrList = mrData.mrAssigned;
        } else {
            mrList = mrData.mrGiven;
        }
        let rate = 0;
        if (mrList && mrList.length > 0) {
            rate = (mrList.length - mrData.mrToReview) / mrList.length;
        }
        return Math.floor(rate * 100);
    }, [appStatus, mrData, currentTab]);

    const mrDataReviewRatio = mrData ? `${mrData.mrReviewed} / ${mrData.mrGiven.length}` : 'Unknown';

    return (
        <ThemeProvider theme={primer}>
            <div className={'container'}>
                <TabNav aria-label="Main" mb={2}>
                    <TabNav.Link
                        href="#ToReview"
                        onClick={() => setCurrentTab(0)}
                        className={currentTab === 0 ? 'selected' : ''}
                    >
                        To Review{' '}
                        <Label variant="small" bg="#dc3545">
                            {mrData ? mrData.mrToReview : 0}
                        </Label>
                    </TabNav.Link>
                    <TabNav.Link
                        href="#UnderReview"
                        onClick={() => setCurrentTab(1)}
                        className={currentTab === 1 ? 'selected' : ''}
                    >
                        Under Review{' '}
                        <Tooltip aria-label={`${mrDataReviewRatio}  have been reviewed`} direction="s">
                            <Label variant="small" bg="#28a745">
                                {mrData ? mrData.mrReviewed : 0}
                            </Label>
                        </Tooltip>
                    </TabNav.Link>
                    <TabNav.Link
                        href="#Issues"
                        onClick={() => setCurrentTab(2)}
                        className={currentTab === 2 ? 'selected' : ''}
                    >
                        Issues{' '}
                        <Tooltip aria-label={`${mrData.issuesAssigned.length}  are assigned to you`} direction="s">
                            <Label variant="small" bg="#fd7e14">
                                {mrData ? mrData.issuesAssigned.length : 0}
                            </Label>
                        </Tooltip>
                    </TabNav.Link>
                    <TabNav.Link
                        href="#ToDoList"
                        onClick={() => setCurrentTab(3)}
                        className={currentTab === 3 ? 'selected' : ''}
                    >
                        To-Do List{' '}
                        <Label variant="small" bg="#1f78d1">
                            {mrData ? mrData.todos.length : 0}
                        </Label>
                    </TabNav.Link>
                </TabNav>
                {getContent()}
                <Flex flexWrap="nowrap">
                    <Tooltip
                        className={'progressBar'}
                        aria-label={`${getMrRatio()}% done, keep the good reviews!`}
                        direction="n"
                    >
                        <ProgressBar progress={getMrRatio()} />
                    </Tooltip>

                    <div style={{ marginTop: '6px' }}>
                        <Tooltip
                            aria-label={'Last update: ' + getHumanReadableDate(mrData.lastUpdateDateUnix)}
                            direction="n"
                        >
                            <Button onClick={fetchData} variant={'small'} mr={2}>
                                <Octicon icon={Sync} /> Refresh
                            </Button>
                        </Tooltip>

                        <Button onClick={openSettings} variant={'small'}>
                            <Octicon icon={Gear} /> Options
                        </Button>
                    </div>
                </Flex>
            </div>
        </ThemeProvider>
    );
};

export default hot(module)(App);

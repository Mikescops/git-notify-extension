import { hot } from 'react-hot-loader';
import { browser } from 'webextension-polyfill-ts';
import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from '@primer/components';
import { Nav } from './components/Nav';
import { Content } from './components/Content';
import { Footer } from './components/Footer';
import { getMergeRequestList, MergeRequestSendMessageReply } from './utils/mergeRequestDownloader';
import { AppStatus } from './types';

import './style.css';

const App = () => {
    const [appStatus, setAppStatus] = useState<AppStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [mrData, setMrData] = useState<MergeRequestSendMessageReply>({
        mrReceived: [],
        mrToReview: 0,
        mrGiven: [],
        mrReviewed: 0,
        issuesAssigned: [],
        todos: [],
        lastUpdateDateUnix: Date.now()
    });

    const [currentTab, setCurrentTab] = useState(0);
    const [gitlabAddress, setGitlabAddress] = useState('');

    const applySettings = useCallback(() => {
        const getSettings = browser.storage.local.get(['defaultTab', 'gitlabAddress']);
        getSettings.then((settings) => {
            setCurrentTab(settings.defaultTab ? settings.defaultTab : 0);
            setGitlabAddress(settings.gitlabAddress ? settings.gitlabAddress : 'https://gitlab.com');
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

    return (
        <ThemeProvider>
            <div className={'container'}>
                <Nav currentTab={currentTab} setCurrentTab={setCurrentTab} mrData={mrData} />
                <Content appStatus={appStatus} mrData={mrData} currentTab={currentTab} errorMessage={errorMessage} />
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

import * as browser from 'webextension-polyfill';
import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, Box } from '@primer/react';
import { Nav } from './components/Nav';
import { Content } from './components/Content';
import { Footer } from './components/Footer';
import { getMergeRequestList, MergeRequestSendMessageReply } from './utils/mergeRequestDownloader';
import { AppStatus } from './types';

import './style.css';

const App = () => {
    const [appStatus, setAppStatus] = useState<AppStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorStack, setErrorStack] = useState('');
    const [mrData, setMrData] = useState<MergeRequestSendMessageReply>({
        mrReceived: [],
        mrToReview: 0,
        mrGiven: [],
        mrReviewed: 0,
        issues: [],
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
                if (response.error) {
                    setAppStatus('error');
                    setErrorMessage(`${response.error.name}: ${response.error.message}`);
                    setErrorStack(response.error.stack ?? '');
                    return;
                }

                setMrData(response);
                setAppStatus('success');
            })
            .catch((error) => {
                setAppStatus('error');
                setErrorMessage('Something went wrong');
                setErrorStack(error.stack ?? '');
            });
    }, []);

    // call fetch data and apply settings at component mount
    useEffect(() => fetchData(), [fetchData]);
    useEffect(() => applySettings(), [applySettings]);

    return (
        <ThemeProvider colorMode="auto">
            <Box className={'container'} sx={{ bg: 'canvas.default' }}>
                <Nav currentTab={currentTab} setCurrentTab={setCurrentTab} mrData={mrData} />
                <Content
                    appStatus={appStatus}
                    mrData={mrData}
                    currentTab={currentTab}
                    errorMessage={errorMessage}
                    errorStack={errorStack}
                />
                <Footer
                    currentTab={currentTab}
                    mrData={mrData}
                    appStatus={appStatus}
                    fetchData={fetchData}
                    gitlabAddress={gitlabAddress}
                />
            </Box>
        </ThemeProvider>
    );
};

export default App;

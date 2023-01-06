import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, Box } from '@primer/react';
import { Nav } from './components/Nav';
import { Content } from './components/Content';
import { Footer } from './components/Footer';
import { getMergeRequestList, MergeRequestSendMessageReply } from './utils/mergeRequestDownloader';
import { pingBackend } from './utils/ping';
import { TabId } from '../common/types';
import { readConfiguration } from '../common/configuration';
import { AppStatus } from './types';

import './style.css';

export const App = () => {
    const [appStatus, setAppStatus] = useState<AppStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorStack, setErrorStack] = useState('');
    const [mrData, setMrData] = useState<MergeRequestSendMessageReply>({
        mrReceived: [],
        mrToReview: 0,
        mrGiven: [],
        mrReviewed: 0,
        myDrafts: [],
        issues: [],
        todos: [],
        lastUpdateDateUnix: Date.now()
    });

    const [currentTab, setCurrentTab] = useState('to_review' as TabId);
    const [gitlabAddress, setGitlabAddress] = useState('');

    const applySettings = useCallback(() => {
        const getSettings = readConfiguration(['defaultTab', 'gitlabAddress']);
        getSettings.then((settings) => {
            setCurrentTab(settings.defaultTab ? settings.defaultTab : 'to_review');
            setGitlabAddress(settings.gitlabAddress ? settings.gitlabAddress : 'https://gitlab.com');
        });
    }, []);

    const setError = (error: Error) => {
        setAppStatus('error');
        setErrorMessage(error.message);
        setErrorStack(error.stack ?? '');
    };

    // useEffect vs useCallback
    // https://medium.com/@infinitypaul/reactjs-useeffect-usecallback-simplified-91e69fb0e7a3
    const fetchData = useCallback(() => {
        pingBackend()
            .then((backendAvaialble) => {
                if (!backendAvaialble) {
                    return setError(new Error('Extension backend is unresponsive, try to reload the extension'));
                }

                setAppStatus('loading');
                getMergeRequestList()
                    .then((response) => {
                        if (!response) {
                            return setError(new Error('Something went wrong'));
                        }
                        if (response.error) {
                            return setError(response.error);
                        }

                        setMrData(response);
                        setAppStatus('success');
                    })
                    .catch((error) => setError(error));
            })
            .catch((error) => setError(error));
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

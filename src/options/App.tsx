import { hot } from 'react-hot-loader';
import { browser } from 'webextension-polyfill-ts';
import React, { useState, useCallback, useEffect } from 'react';
import { theme as primer, Button, TextInput, Text } from '@primer/components';
import { ThemeProvider } from 'styled-components';
import Octicon, { Key, Server, CloudUpload, Check } from '@primer/octicons-react';
import './style.css';

const getSettings = browser.storage.local.get([
    'gitlabCE',
    'gitlabToken',
    'gitlabAddress',
    'refreshRate',
    'defaultTab'
]);

const App = () => {
    const [gitlabCE, setGitlabCE] = useState(false);
    const [gitlabToken, setGitlabToken] = useState('');
    const [gitlabAddress, setGitlabAddress] = useState('');
    const [refreshRate, setRefreshRate] = useState(40);
    const [defaultTab, setDefaultTab] = useState(0);
    const [testSuccess, setTestSuccess] = useState(null);
    const [isGitlabTokenInLocalStorage, setIsGitlabTokenInLocalStorage] = useState(false);
    const [isGitlabAddressInLocalStorage, setIsGitlabAddressInLocalStorage] = useState(false);
    const [isRefreshRateInLocalStorage, setIsRefreshRateInLocalStorage] = useState(false);

    useEffect(() => {
        getSettings.then((settings) => {
            setGitlabCE(settings.gitlabCE ? settings.gitlabCE : false);
            setGitlabToken(settings.gitlabToken ? settings.gitlabToken : '');
            setIsGitlabTokenInLocalStorage(settings.gitlabToken);
            setGitlabAddress(settings.gitlabAddress ? settings.gitlabAddress : '');
            setIsGitlabAddressInLocalStorage(settings.gitlabAddress);
            setRefreshRate(settings.refreshRate ? settings.refreshRate : 40);
            setDefaultTab(settings.defaultTab ? settings.defaultTab : '');
        });
    }, []);

    const updateGitlabCE = (event: any) => {
        setGitlabCE(event.target.checked);
        browser.storage.local.set({ gitlabCE: event.target.checked }).then(() => {
            console.log('Configuration Updated');
        });
    };

    const updateGitlabToken = (event: any) => {
        setGitlabToken(event.target.value);
        browser.storage.local.set({ gitlabToken: event.target.value }).then(() => {
            console.log('Configuration Updated');
            setIsGitlabTokenInLocalStorage(true);
        });
    };

    const updateGitlabAddress = (event: any) => {
        setGitlabAddress(event.target.value);
        browser.storage.local.set({ gitlabAddress: event.target.value }).then(() => {
            console.log('Configuration Updated');
            setIsGitlabAddressInLocalStorage(true);
        });
    };

    const updateRefreshRate = (event: any) => {
        setRefreshRate(event.target.value);
        browser.storage.local.set({ refreshRate: parseInt(event.target.value) }).then(() => {
            console.log('Configuration Updated');
            setIsRefreshRateInLocalStorage(true);
        });
        browser.runtime.sendMessage({ type: 'updateRefreshRate', interval: event.target.value }).then();
    };

    const updateDefaultTab = (event: any) => {
        setDefaultTab(event.target.value);
        browser.storage.local.set({ defaultTab: parseInt(event.target.value) }).then(() => {
            console.log('Configuration Updated');
        });
    };

    const testConnection = useCallback(() => {
        browser.runtime.sendMessage({ type: 'pollMR' }).then((success) => setTestSuccess(success));
    }, []);

    return (
        <ThemeProvider theme={primer}>
            <Text as="strong" mt={2}>
                Using Gitlab Community Edition? (approvals are a premium feature)
            </Text>
            <br />
            <label>
                <input
                    type="checkbox"
                    name="gitlabCE"
                    value="Gitlab CE Mode"
                    onChange={updateGitlabCE}
                    checked={gitlabCE ? true : false}
                />{' '}
                Gitlab CE Mode
            </label>
            <br />
            <br />
            <Text as="strong" mt={2}>
                Personal Gitlab Tuken (api + read_user)
            </Text>
            <br />
            <TextInput
                icon={Key as any}
                variant={'small'}
                name="gitlab-token"
                value={gitlabToken}
                placeholder="Personal Gitlab Token"
                onChange={updateGitlabToken}
                aria-label="gitlab-token"
            />{' '}
            {isGitlabTokenInLocalStorage ? <Octicon icon={Check} /> : ''}
            <br />
            <br />
            <Text as="strong" mt={2}>
                Gitlab host address
            </Text>
            <br />
            <TextInput
                icon={Server as any}
                variant={'small'}
                name="gitlab-address"
                value={gitlabAddress}
                placeholder="https://gitlab.com"
                onChange={updateGitlabAddress}
                aria-label="gitlab-address"
            />{' '}
            {isGitlabAddressInLocalStorage ? <Octicon icon={Check} /> : ''}
            <br />
            <br />
            <Text as="strong" mt={2}>
                Refresh rate in seconds (it is recommended not to go below 30)
            </Text>
            <br />
            <input type="number" name="refreshRate" min="20" value={refreshRate} onChange={updateRefreshRate} />{' '}
            {isRefreshRateInLocalStorage ? <Octicon icon={Check} /> : ''}
            <br />
            <br />
            <Text as="strong" mt={2}>
                Default tab
            </Text>
            <br />
            <select name="default-tab" onChange={updateDefaultTab}>
                <option selected={defaultTab === 0} value="0">
                    To Review
                </option>
                <option selected={defaultTab === 1} value="1">
                    Under Review
                </option>
                <option selected={defaultTab === 2} value="2">
                    To-Do List
                </option>
            </select>
            <hr />
            <div>
                <Button onClick={testConnection} variant={'small'}>
                    <Octicon icon={CloudUpload} /> Test my settings
                </Button>
                <Text
                    as="span"
                    opacity={testSuccess === null ? 0 : 100}
                    color={testSuccess === true ? 'green.6' : 'red.6'}
                >
                    {' '}
                    {testSuccess === true ? 'Success' : 'Could not connect'}
                </Text>
            </div>
        </ThemeProvider>
    );
};

export default hot(module)(App);

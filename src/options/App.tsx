import { hot } from 'react-hot-loader';
import { browser } from 'webextension-polyfill-ts';
import React, { useState, useCallback } from 'react';
import { theme as primer, Button, TextInput, Text } from '@primer/components';
import { ThemeProvider } from 'styled-components';
import Octicon, { Key, Server, CloudUpload } from '@primer/octicons-react';
import './style.css';

const App = () => {
    const getSettings = browser.storage.local.get(['gitlabToken', 'gitlabAddress']);

    const [gitlabToken, insertGitlabToken] = useState('null');
    const [gitlabAddress, insertGitlabAddress] = useState('null');
    const [testSuccess, updateTestSuccess] = useState(null);

    if (gitlabToken === 'null' || gitlabAddress === 'null') {
        getSettings.then((settings) => {
            insertGitlabToken(settings.gitlabToken ? settings.gitlabToken : '');
            insertGitlabAddress(settings.gitlabAddress ? settings.gitlabAddress : '');
        });
    }

    const updateGitlabToken = (event: any) => {
        insertGitlabToken(event.target.value);
        browser.storage.local.set({ gitlabToken: event.target.value }).then(() => console.log('Configuration Updated'));
    };

    const updateGitlabAddress = (event: any) => {
        insertGitlabAddress(event.target.value);
        browser.storage.local
            .set({ gitlabAddress: event.target.value })
            .then(() => console.log('Configuration Updated'));
    };

    const testConnection = useCallback(() => {
        browser.runtime.sendMessage({ type: 'pollMR' }).then((success) => updateTestSuccess(success));
    }, []);

    return (
        <ThemeProvider theme={primer}>
            <Text as="strong" mt={2}>
                Personal Gitlab Token (api + read_user)
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
            />
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
            />
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
                    {testSuccess === true ? 'Success' : 'Could not connect'}
                </Text>
            </div>
        </ThemeProvider>
    );
};

export default hot(module)(App);

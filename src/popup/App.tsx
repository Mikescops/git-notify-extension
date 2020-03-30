import { hot } from 'react-hot-loader';
import { browser } from 'webextension-polyfill-ts';
import React, { useState, useCallback } from 'react';
import { Button, FilterList, Flex, Text, ProgressBar, TabNav, Label, theme as primer } from '@primer/components';
import { ThemeProvider } from 'styled-components';
import Octicon, { Sync, Gear } from '@primer/octicons-react';
import { MergeRequest } from './components/MergeRequest';
import './style.css';
import { MergeRequestsDetails } from '../background/types';

const App = () => {
    const [mrList, updateList] = useState(null);
    const [mrToReview, setMrToReview] = useState(0);
    const [mrReviewed, setMrReviewed] = useState(0);
    const [mrRatio, setMrRatio] = useState(100);

    const [tabSelected, setTabSelected] = useState(0);

    const openSettings = useCallback(() => browser.runtime.openOptionsPage(), []);

    let type = 'getMRs';

    const sendMsg = useCallback((event: any) => {
        if (event && event.target.dataset.key) {
            setTabSelected(event.target.dataset.id);
            type = event.target.dataset.key;
        }
        browser.runtime
            .sendMessage({ type: 'getMRs' })
            .then((response) => {
                if (!response) {
                    // This could infinite loop, so let's see for a correct retry
                    console.log('Retrying');
                    return setTimeout(sendMsg(type), 1000);
                }

                if (response.error) {
                    return updateList(
                        <Text as="p" m={2}>
                            {response.error}
                        </Text>
                    );
                }

                let mrNewList: MergeRequestsDetails[] = null;
                if (type === 'getMRs') {
                    mrNewList = response.mrAssigned;
                } else {
                    mrNewList = response.mrGiven;
                }
                console.log('Displayed list', mrNewList);

                const listItems = mrNewList.map((mr) => {
                    return <MergeRequest mr={mr} key={mr.id} />;
                });

                updateList(listItems);
                setMrToReview(response.mrToReview);
                setMrReviewed(response.mrReviewed);
                setMrRatio(Math.floor(((mrNewList.length - response.mrToReview) / mrNewList.length) * 100));
            })
            .catch((error) => console.error(error));
    }, []);

    if (!mrList) {
        sendMsg(null);
    }

    return (
        <ThemeProvider theme={primer}>
            <div className={'container'}>
                <TabNav aria-label="Main" mb={2}>
                    <TabNav.Link
                        onClick={sendMsg}
                        data-key={'getMRs'}
                        data-id={0}
                        href="#MR"
                        className={tabSelected === 0 ? 'selected' : ''}
                    >
                        To Review{' '}
                        <Label variant="small" bg="#dc3545">
                            {mrToReview}
                        </Label>
                    </TabNav.Link>
                    <TabNav.Link
                        onClick={sendMsg}
                        data-key={'getMyMRs'}
                        data-id={1}
                        href="#MyMR"
                        className={tabSelected === 1 ? 'selected' : ''}
                    >
                        Under Review{' '}
                        <Label variant="small" bg="#28a745">
                            {mrReviewed}
                        </Label>
                    </TabNav.Link>
                </TabNav>
                <FilterList className={'mrList'}>{mrList}</FilterList>
                <Flex flexWrap="nowrap">
                    <ProgressBar
                        progress={mrRatio}
                        m={3}
                        style={{ flex: 1 }}
                        title={`${mrRatio}% done, keep the good reviews!`}
                    />

                    <div style={{ marginTop: '8px' }}>
                        <Button onClick={sendMsg} variant={'small'} mr={2}>
                            <Octicon icon={Sync} /> Refresh
                        </Button>
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

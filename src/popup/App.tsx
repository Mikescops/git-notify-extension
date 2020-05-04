import { hot } from 'react-hot-loader';
import { browser } from 'webextension-polyfill-ts';
import React, { useState, useCallback } from 'react';
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
import emptyInbox from './assets/empty_inbox.svg';
import './style.css';
import { MergeRequestsDetails, StoredData, Comment } from '../background/types';
import { getHumanReadableDate } from './helpers';

const App = () => {
    const fetchingContentState = <Text>Fetching content...</Text>;
    const [mrList, updateList] = useState(fetchingContentState);
    const [mrToReview, setMrToReview] = useState('0');
    const [mrReviewed, setMrReviewed] = useState('0');
    const [mrRatio, setMrRatio] = useState(100);
    const [lastUpdateDateUnix, setLastUpdateDateUnix] = useState(0);

    const [tabSelected, setTabSelected] = useState('0');

    const openSettings = useCallback(() => browser.runtime.openOptionsPage(), []);

    let type = 'getMRs';

    interface SendMsgResponse extends StoredData {
        lastUpdateDateUnix: number;
    }
    interface SendMsgError {
        error: string;
    }
    const sendMsg = useCallback((event: any) => {
        if (event && event.target.dataset.key) {
            setTabSelected(event.target.dataset.id);
            type = event.target.dataset.key;
        }
        browser.runtime
            .sendMessage({ type: 'getMRs' })
            .then((response: SendMsgResponse | SendMsgError) => {
                if (!response) {
                    // This could infinite loop, so let's see for a correct retry
                    console.log('Retrying');
                    return setTimeout(sendMsg(type), 1000);
                }

                if ('error' in response) {
                    return updateList(
                        <Flash m={2} scheme="red">
                            {response.error}
                        </Flash>
                    );
                }

                let mrNewList: MergeRequestsDetails[];
                let commentsNewList: Comment[];
                if (type === 'getMRs') {
                    mrNewList = response.mrAssigned;
                    commentsNewList = response.reviewChanges.newCommentsAssigned;
                } else {
                    mrNewList = response.mrGiven;
                    commentsNewList = response.reviewChanges.newCommentsGiven;
                }
                console.log('Displayed list', mrNewList, commentsNewList);

                if (mrNewList.length === 0) {
                    updateList(<img src={emptyInbox} className={'emptyInbox'} />);
                } else {
                    const listItems = mrNewList.map((mr) => {
                        const comments = commentsNewList.filter((comment) => comment.noteable_id === mr.id);
                        return <MergeRequest mr={mr} comments={comments} key={mr.id} />;
                    });

                    updateList(<FilterList className={'mrList'}>{listItems}</FilterList>);
                }

                setMrToReview(`${response.mrToReview}`);
                setMrReviewed(`${response.mrReviewed} / ${response.mrGiven.length}`);
                setMrRatio(Math.floor(((mrNewList.length - response.mrToReview) / mrNewList.length) * 100) || 100);
                setLastUpdateDateUnix(response.lastUpdateDateUnix);
            })
            .catch((error) => console.error(error));
    }, []);

    if (mrList === fetchingContentState) {
        sendMsg(null);
    }

    return (
        <ThemeProvider theme={primer}>
            <div className={'container'}>
                <TabNav aria-label="Main" mb={2}>
                    <TabNav.Link
                        onClick={sendMsg}
                        data-key={'getMRs'}
                        data-id={'0'}
                        href="#MR"
                        className={tabSelected === '0' ? 'selected' : ''}
                    >
                        To Review{' '}
                        <Label variant="small" bg="#dc3545">
                            {mrToReview}
                        </Label>
                    </TabNav.Link>
                    <TabNav.Link
                        onClick={sendMsg}
                        data-key={'getMyMRs'}
                        data-id={'1'}
                        href="#MyMR"
                        className={tabSelected === '1' ? 'selected' : ''}
                    >
                        Under Review{' '}
                        <Tooltip aria-label={mrReviewed + ' have been reviewed'} direction="s">
                            <Label variant="small" bg="#28a745">
                                {mrReviewed}
                            </Label>
                        </Tooltip>
                    </TabNav.Link>
                </TabNav>
                {mrList}
                <Flex flexWrap="nowrap">
                    <Tooltip
                        className={'progressBar'}
                        aria-label={`${mrRatio}% done, keep the good reviews!`}
                        direction="n"
                    >
                        <ProgressBar progress={mrRatio} />
                    </Tooltip>

                    <div style={{ marginTop: '6px' }}>
                        <Tooltip aria-label={'Last update: ' + getHumanReadableDate(lastUpdateDateUnix)} direction="n">
                            <Button onClick={sendMsg} variant={'small'} mr={2}>
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

import * as browser from 'webextension-polyfill';
import { useCallback } from 'react';
import { Box, Tooltip, ProgressBar, Button, Link } from '@primer/react';
import { SyncIcon, VersionsIcon, PeopleIcon, GearIcon } from '@primer/octicons-react';
import { getHumanReadableDate } from '../helpers';
import { MergeRequestSendMessageReply } from '../utils/mergeRequestDownloader';
import { TabId } from '../../common/types';
import { AppStatus } from '../types';

interface Props {
    currentTab: TabId;
    mrData: MergeRequestSendMessageReply;
    appStatus: AppStatus;
    fetchData: () => void;
    gitlabAddress: string;
}

export const Footer = (props: Props) => {
    const { currentTab, mrData, appStatus, fetchData, gitlabAddress } = props;

    const openSettings = useCallback(() => browser.runtime.openOptionsPage(), []);

    const getMrRatio = useCallback(() => {
        if (appStatus !== 'success' || mrData === null) {
            return -1;
        }
        let mrNumber = 0;
        let mrTotal = 0;
        if (currentTab === 'to_review') {
            mrTotal = mrData.mrReceived?.length ?? 0;
            mrNumber = mrTotal - mrData.mrToReview;
        } else if (currentTab === 'under_review') {
            mrTotal = mrData.mrGiven?.length ?? 0;
            mrNumber = mrData.mrReviewed;
        } else {
            return -1;
        }
        let rate = 0;
        if (mrNumber && mrTotal) {
            rate = mrNumber / mrTotal;
        }
        return Math.floor(rate * 100);
    }, [appStatus, mrData, currentTab]);

    return (
        <Box display="flex" flexWrap="nowrap">
            <Tooltip
                className={'progressBar'}
                aria-label={
                    getMrRatio() >= 0 ? `${getMrRatio()}% reviewed, keep the good work!` : 'Nothing to measure here...'
                }
                direction="n"
            >
                <ProgressBar progress={getMrRatio()} />
            </Tooltip>

            <Box display="flex" flexWrap="nowrap" style={{ marginTop: '6px' }}>
                <Tooltip aria-label={'Last update: ' + getHumanReadableDate(mrData.lastUpdateDateUnix)} direction="n">
                    <Button onClick={fetchData} variant="default" size="small" sx={{ mr: 2 }}>
                        <SyncIcon /> Refresh
                    </Button>
                </Tooltip>

                <Tooltip aria-label={'Open your projects'} direction="n">
                    <Link href={gitlabAddress + '/dashboard/projects'} target="_blank">
                        <Button variant="default" size="small" sx={{ mr: 2 }}>
                            <VersionsIcon />
                        </Button>
                    </Link>
                </Tooltip>

                <Tooltip aria-label={'Open your groups'} direction="n">
                    <Link href={gitlabAddress + '/dashboard/groups'} target="_blank">
                        <Button variant="default" size="small" sx={{ mr: 2 }}>
                            <PeopleIcon />
                        </Button>
                    </Link>
                </Tooltip>

                <Button onClick={openSettings} variant="default" size="small">
                    <GearIcon /> Options
                </Button>
            </Box>
        </Box>
    );
};

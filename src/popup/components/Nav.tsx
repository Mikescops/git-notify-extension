import React from 'react';
import { TabNav, Label, Tooltip } from '@primer/react';
import { CodeOfConductIcon } from '@primer/octicons-react';
import { MergeRequestSendMessageReply } from '../utils/mergeRequestDownloader';

interface Props {
    currentTab: number;
    setCurrentTab: React.Dispatch<React.SetStateAction<number>>;
    mrData: MergeRequestSendMessageReply;
}

export const Nav = (props: Props) => {
    const { currentTab, setCurrentTab, mrData } = props;

    const mrDataReviewRatio =
        mrData?.mrReviewed || mrData?.mrGiven ? `${mrData.mrReviewed} / ${mrData.mrGiven.length}` : 'Unknown';
    const issuesAssignedNumber = mrData?.issuesAssigned ? mrData.issuesAssigned.length : 0;

    return (
        <TabNav aria-label="Main" className={'navbarCategories'}>
            <TabNav.Link
                href="#ToReview"
                onClick={() => setCurrentTab(0)}
                className={currentTab === 0 ? 'selected' : ''}
            >
                To Review{' '}
                <Label size="small" sx={{ bg: '#dc3545', color: 'canvas.default' }}>
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
                    <Label size="small" sx={{ bg: '#28a745', color: 'canvas.default' }}>
                        {mrData ? mrDataReviewRatio : 0}
                    </Label>
                </Tooltip>
            </TabNav.Link>
            <TabNav.Link href="#Issues" onClick={() => setCurrentTab(2)} className={currentTab === 2 ? 'selected' : ''}>
                Issues{' '}
                <Tooltip aria-label={`${issuesAssignedNumber}  are assigned to you`} direction="s">
                    <Label size="small" sx={{ bg: '#fd7e14', color: 'canvas.default' }}>
                        {issuesAssignedNumber}
                    </Label>
                </Tooltip>
            </TabNav.Link>
            <TabNav.Link
                href="#ToDoList"
                onClick={() => setCurrentTab(3)}
                className={currentTab === 3 ? 'selected' : ''}
            >
                To-Do List{' '}
                <Label size="small" sx={{ bg: '#1f78d1', color: 'canvas.default' }}>
                    {mrData?.todos ? mrData.todos.length : 0}
                </Label>
            </TabNav.Link>
            <TabNav.Link href="#Pick" onClick={() => setCurrentTab(4)} className={currentTab === 4 ? 'selected' : ''}>
                <CodeOfConductIcon /> Pick
            </TabNav.Link>
        </TabNav>
    );
};

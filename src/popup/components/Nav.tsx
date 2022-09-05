import React from 'react';
import { TabNav, Label, Tooltip } from '@primer/react';
import { CodeOfConductIcon } from '@primer/octicons-react';
import { MergeRequestSendMessageReply } from '../utils/mergeRequestDownloader';
import { TabId } from '../../common/types';

interface Props {
    currentTab: TabId;
    setCurrentTab: React.Dispatch<React.SetStateAction<TabId>>;
    mrData: MergeRequestSendMessageReply;
}

export const Nav = (props: Props) => {
    const { currentTab, setCurrentTab, mrData } = props;

    const mrDataReviewRatio =
        mrData?.mrReviewed || mrData?.mrGiven ? `${mrData.mrReviewed} / ${mrData.mrGiven.length}` : 'Unknown';
    const issuesCount = mrData?.issues ? mrData.issues.length : 0;

    return (
        <TabNav aria-label="Main" className={'navbarCategories'}>
            <TabNav.Link
                href="#ToReview"
                onClick={() => setCurrentTab('to_review')}
                className={currentTab === 'to_review' ? 'selected' : ''}
            >
                To Review{' '}
                <Label size="small" sx={{ bg: '#dc3545', color: 'canvas.default' }}>
                    {mrData ? mrData.mrToReview : 0}
                </Label>
            </TabNav.Link>
            <TabNav.Link
                href="#UnderReview"
                onClick={() => setCurrentTab('under_review')}
                className={currentTab === 'under_review' ? 'selected' : ''}
            >
                Under Review{' '}
                <Tooltip aria-label={`${mrDataReviewRatio}  have been reviewed`} direction="s">
                    <Label size="small" sx={{ bg: '#28a745', color: 'canvas.default' }}>
                        {mrData ? mrDataReviewRatio : 0}
                    </Label>
                </Tooltip>
            </TabNav.Link>
            <TabNav.Link
                href="#Drafts"
                onClick={() => setCurrentTab('drafts')}
                className={currentTab === 'drafts' ? 'selected' : ''}
            >
                Drafts{' '}
                <Label size="small" sx={{ bg: '#484848', color: 'canvas.default' }}>
                    {mrData?.myDrafts?.length ?? 0}
                </Label>
            </TabNav.Link>
            <TabNav.Link
                href="#Issues"
                onClick={() => setCurrentTab('issues')}
                className={currentTab === 'issues' ? 'selected' : ''}
            >
                Issues{' '}
                <Tooltip aria-label={`${issuesCount}  are assigned to you`} direction="s">
                    <Label size="small" sx={{ bg: '#fd7e14', color: 'canvas.default' }}>
                        {issuesCount}
                    </Label>
                </Tooltip>
            </TabNav.Link>
            <TabNav.Link
                href="#ToDoList"
                onClick={() => setCurrentTab('todo_list')}
                className={currentTab === 'todo_list' ? 'selected' : ''}
            >
                To-Do List{' '}
                <Label size="small" sx={{ bg: '#1f78d1', color: 'canvas.default' }}>
                    {mrData?.todos ? mrData.todos.length : 0}
                </Label>
            </TabNav.Link>
            <TabNav.Link
                href="#Pick"
                onClick={() => setCurrentTab('pick')}
                className={currentTab === 'pick' ? 'selected' : ''}
            >
                <CodeOfConductIcon /> Pick
            </TabNav.Link>
        </TabNav>
    );
};

import React from 'react';
import { UnderlineNav } from '@primer/react';
import { CodeOfConductIcon, Icon } from '@primer/octicons-react';
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
        mrData?.mrReviewed || mrData?.mrGiven ? `${mrData.mrReviewed} / ${mrData.mrGiven.length}` : undefined;
    const issuesCount = mrData?.issues ? mrData.issues.length : 0;

    interface NavItem {
        label: string;
        navigation: TabId;
        color: string;
        counter?: string | number;
        icon?: Icon;
    }

    const items: NavItem[] = [
        {
            label: 'To Review',
            navigation: 'to_review',
            color: '220, 53, 69',
            counter: mrData?.mrToReview
        },
        {
            label: 'Under Review',
            navigation: 'under_review',
            color: '40, 167, 69',
            counter: mrDataReviewRatio
        },
        {
            label: 'Drafts',
            navigation: 'drafts',
            color: '72, 72, 72',
            counter: mrData?.myDrafts?.length
        },
        { label: 'Issues', navigation: 'issues', color: '253, 126, 20', counter: issuesCount },
        {
            label: 'To-Do List',
            navigation: 'todo_list',
            color: '31, 120, 209',
            counter: mrData?.todos?.length
        },
        { label: 'Pick', navigation: 'pick', color: '200, 200, 200', icon: CodeOfConductIcon }
    ];

    return (
        <UnderlineNav aria-label="Main" loadingCounters={!mrData}>
            {items.map((item, index) => (
                <UnderlineNav.Item
                    key={index}
                    href={`#${item.navigation}`}
                    onClick={() => setCurrentTab(item.navigation)}
                    aria-current={currentTab === item.navigation ? 'page' : undefined}
                    counter={item.counter}
                    icon={item.icon}
                    sx={{
                        ':hover': { backgroundColor: `rgba(${item.color}, 0.1)` },
                        ':is([aria-current="page"])': {
                            'backgroundColor': `rgba(${item.color}, 0.2)`,
                            'span:is([data-component="text"])': { fontWeight: 400 }
                        },
                        'span:last-child': { span: { backgroundColor: `rgb(${item.color})`, color: '#fff' } }
                    }}
                >
                    {item.label}
                </UnderlineNav.Item>
            ))}
        </UnderlineNav>
    );
};

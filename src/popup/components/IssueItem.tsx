import React from 'react';
import { BranchName, FilterList, Flex, Box, Link, Label, Tooltip } from '@primer/components';
import Octicon, { Clock, CommentDiscussion, Plus, Repo } from '@primer/octicons-react';
import { AvatarWithTooltip } from './AvatarWithTooltip';
import { calculateTimeElapsed } from '../helpers';
import { Issue } from '../../background/types';

interface Props {
    issue: Issue;
}

export const IssueItem = ({ issue }: Props) => {
    const timeElapsed = calculateTimeElapsed(issue.created_at);

    const avatars = issue.assignees
        .slice(0, 3)
        .map((assignee) => <AvatarWithTooltip approvals={null} assignee={assignee} key={assignee.id} />);

    return (
        <FilterList.Item as="div" className={'mrItem'}>
            <Flex flexWrap="nowrap">
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={issue.web_url}
                        className={'mrTitle'}
                        target="_blank"
                        title={`${issue.title} - ${issue.author.name}\n${issue.description}`}
                    >
                        {issue.title} - {issue.author.name}
                    </Link>
                    <div>
                        <BranchName as="span" mr={2} className={'mrBranchName'}>
                            <Octicon icon={Repo} /> {issue.references.full}
                        </BranchName>
                        <Label variant="medium" bg="white" color="black" className={'mrLabel'}>
                            <Octicon icon={CommentDiscussion} /> {issue.user_notes_count}
                        </Label>
                        <Label variant="medium" bg="white" color="#8e8e8e" className={'mrLabel'}>
                            <Octicon icon={Clock} /> {timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box className={'avatarsList'}>
                    {avatars}{' '}
                    {issue.assignees.length > 3 ? (
                        <Tooltip
                            className={'moreAssigneesIcon'}
                            aria-label={`and ${issue.assignees.length - 3} more`}
                            direction="w"
                        >
                            <Octicon icon={Plus} />
                        </Tooltip>
                    ) : (
                        ''
                    )}
                </Box>
            </Flex>
        </FilterList.Item>
    );
};

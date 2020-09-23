import React from 'react';
import { Avatar, BranchName, FilterList, Flex, Box, Link, Label, Tooltip } from '@primer/components';
import { ClockIcon, CommentDiscussionIcon, PlusIcon, RepoIcon } from '@primer/octicons-react';
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
        .map((assignee) => <AvatarWithTooltip assignee={assignee} key={assignee.id} />);

    return (
        <FilterList.Item as="div" className={'mrItem'}>
            <Flex flexWrap="nowrap">
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={issue.web_url}
                        className={'mrTitle'}
                        target="_blank"
                        color="#000"
                        title={`${issue.title} - ${issue.author.name}\n${issue.description}`}
                    >
                        {issue.title}
                    </Link>
                    <div>
                        <Tooltip mr={2} aria-label={issue.author.name} direction="e" className={'inline-avatar'}>
                            <Avatar src={issue.author.avatar_url} size={20} className={'avatar-small'} />
                        </Tooltip>
                        <BranchName as="span" mr={2} className={'mrBranchName'}>
                            <RepoIcon /> {issue.references.full}
                        </BranchName>
                        <Label variant="medium" bg="white" color="black" className={'mrLabel'}>
                            <CommentDiscussionIcon /> {issue.user_notes_count}
                        </Label>
                        <Label variant="medium" bg="white" color="#8e8e8e" className={'mrLabel'}>
                            <ClockIcon /> {timeElapsed}
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
                            <PlusIcon />
                        </Tooltip>
                    ) : (
                        ''
                    )}
                </Box>
            </Flex>
        </FilterList.Item>
    );
};

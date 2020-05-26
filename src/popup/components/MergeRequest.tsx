import React, { useState } from 'react';
import { Avatar, BranchName, FilterList, Flex, Box, Link, Label, Tooltip } from '@primer/components';
import Octicon, { GitMerge, IssueClosed, IssueOpened, Clock, CommentDiscussion, Plus } from '@primer/octicons-react';
import { AvatarWithTooltip } from './AvatarWithTooltip';
import { calculateTimeElapsed } from '../helpers';
import { MergeRequestsDetails } from '../../background/types';

interface Props {
    mr: MergeRequestsDetails;
}

export const MergeRequest = ({ mr }: Props) => {
    let mrApproved = false;
    if (mr.approvals.user_has_approved) {
        mrApproved = true;
    }

    const timeElapsed = calculateTimeElapsed(mr.created_at);

    const [copyBranchStatus, setCopyBranchStatus] = useState(false);
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopyBranchStatus(true);
    };

    const avatars = mr.assignees
        .slice(0, 3)
        .map((assignee) => <AvatarWithTooltip approvals={mr.approvals} assignee={assignee} key={assignee.id} />);

    return (
        <FilterList.Item as="div" className={mrApproved ? 'mrApproved mrItem' : 'mrItem'}>
            <Flex flexWrap="nowrap">
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={mr.web_url}
                        className={'mrTitle'}
                        target="_blank"
                        title={`${mr.title} - ${mr.author.name}\n${mr.description}`}
                    >
                        {mr.title}
                    </Link>
                    <div>
                        <Tooltip mr={2} aria-label={mr.author.name} direction="e" className={'inline-avatar'}>
                            <Avatar src={mr.author.avatar_url} size={20} className={'avatar-small'} />
                        </Tooltip>
                        <Tooltip
                            aria-label={copyBranchStatus ? '✔️ Copied' : '📋 Copy branch name to clipboard'}
                            direction="n"
                        >
                            <BranchName
                                as="span"
                                mr={2}
                                className={'mrBranchName'}
                                title={mr.source_branch}
                                onClick={() => copyToClipboard(mr.source_branch)}
                            >
                                <Octicon icon={GitMerge} /> {mr.references.full}
                            </BranchName>
                        </Tooltip>
                        {mr.merge_status === 'can_be_merged' ? (
                            <Label variant="medium" bg="#28a745" className={'mrLabel'} title="Can be merged">
                                <Octicon icon={IssueClosed} />
                            </Label>
                        ) : (
                            <Label variant="medium" bg="#dc3545" className={'mrLabel'} title="Cannot be merged">
                                <Octicon icon={IssueOpened} />
                            </Label>
                        )}
                        <Label variant="medium" bg="white" color="black" className={'mrLabel'}>
                            <Octicon icon={CommentDiscussion} /> {mr.user_notes_count}
                        </Label>
                        <Label variant="medium" bg="white" color="#8e8e8e" className={'mrLabel'}>
                            <Octicon icon={Clock} /> {timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box className={'avatarsList'}>
                    {avatars}{' '}
                    {mr.assignees.length > 3 ? (
                        <Tooltip
                            className={'moreAssigneesIcon'}
                            aria-label={`and ${mr.assignees.length - 3} more`}
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

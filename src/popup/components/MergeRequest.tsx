import React, { useState } from 'react';
import { Avatar, BranchName, FilterList, Flex, Box, Link, Label, Tooltip } from '@primer/components';
import {
    GitMergeIcon,
    IssueClosedIcon,
    IssueOpenedIcon,
    ClockIcon,
    CommentDiscussionIcon,
    PlusIcon
} from '@primer/octicons-react';
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
        .map((assignee) => {
            return {
                ...assignee,
                approved:
                    mr.approvals &&
                    mr.approvals.approved_by.filter((approval) => {
                        return approval.user.id === assignee.id;
                    }).length > 0
            };
        })
        .sort((a, b) => Number(b.approved) - Number(a.approved))
        .slice(0, 3);

    const avatarsUI = avatars.map((assignee) => <AvatarWithTooltip assignee={assignee} key={assignee.id} />);

    return (
        <FilterList.Item as="div" className={mrApproved ? 'mrApproved mrItem' : 'mrItem'}>
            <Flex flexWrap="nowrap">
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={mr.web_url}
                        className={'mrTitle'}
                        target="_blank"
                        color={mr.approvals.approved ? '#0b7f26' : '#000'}
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
                                <GitMergeIcon /> {mr.references.full}
                            </BranchName>
                        </Tooltip>
                        {mr.merge_status === 'can_be_merged' && mr.approvals.approved ? (
                            <Label
                                variant="medium"
                                bg="#28a745"
                                className={'mrLabel'}
                                title="Approved and can be merged!"
                            >
                                <IssueClosedIcon />
                            </Label>
                        ) : null}
                        {mr.merge_status !== 'can_be_merged' && mr.approvals.approved ? (
                            <Label
                                variant="medium"
                                bg="#fd7e14"
                                className={'mrLabel'}
                                title="Approved but you may need to rebase before merging."
                            >
                                <IssueOpenedIcon />
                            </Label>
                        ) : null}
                        {mr.merge_status !== 'can_be_merged' && !mr.approvals.approved ? (
                            <Label
                                variant="medium"
                                bg="#dc3545"
                                className={'mrLabel'}
                                title="Cannot be merged, you may need to rebase first."
                            >
                                <IssueOpenedIcon />
                            </Label>
                        ) : null}
                        <Label variant="medium" bg="white" color="black" className={'mrLabel'}>
                            <CommentDiscussionIcon /> {mr.user_notes_count}
                        </Label>
                        <Label variant="medium" bg="white" color="#8e8e8e" className={'mrLabel'}>
                            <ClockIcon /> {timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box className={'avatarsList'}>
                    {avatarsUI}{' '}
                    {mr.assignees.length > 3 ? (
                        <Tooltip
                            className={'moreAssigneesIcon'}
                            aria-label={`and ${mr.assignees.length - 3} more`}
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

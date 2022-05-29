import React, { useState } from 'react';
import { Avatar, BranchName, FilterList, Box, Link, Label, Tooltip } from '@primer/react';
import {
    GitMergeIcon,
    IssueClosedIcon,
    IssueOpenedIcon,
    ClockIcon,
    CommentDiscussionIcon,
    PlusIcon
} from '@primer/octicons-react';
import { AvatarWithTooltip } from './AvatarWithTooltip';
import { calculateTimeElapsed, removeDuplicateObjectFromArray } from '../helpers';
import { GitlabTypes, MergeRequestsDetails } from '../../background/types';

interface Props {
    mr: MergeRequestsDetails;
}

export const MergeRequestItem = ({ mr }: Props) => {
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

    const author = mr.author as GitlabTypes.UserSchema;
    const reviewers = removeDuplicateObjectFromArray([...(mr.assignees ?? []), ...(mr.reviewers ?? [])], 'id');

    const avatars = reviewers
        .map((assignee) => {
            return {
                ...assignee,
                approved:
                    mr.approvals &&
                    mr.approvals.approved_by &&
                    mr.approvals.approved_by.filter((approval) => {
                        return approval.user.id === assignee.id;
                    }).length > 0
            };
        })
        .sort((a, b) => Number(b.approved) - Number(a.approved))
        .slice(0, 3);

    const avatarsUI = avatars.map((assignee) => <AvatarWithTooltip assignee={assignee} key={assignee.id} />);

    return (
        <FilterList.Item className={mrApproved ? 'mrApproved mrItem' : 'mrItem'}>
            <Box display="flex" flexWrap="nowrap">
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={mr.web_url}
                        className={'mrTitle'}
                        target="_blank"
                        sx={{ color: mr.approvals.approved ? 'success.fg' : 'fg.default' }}
                        title={`${mr.title} - ${author.name}\n${mr.description}`}
                    >
                        {mr.title}
                    </Link>
                    <div>
                        <Tooltip
                            sx={{ mr: 2 }}
                            aria-label={author.name || ''}
                            direction="e"
                            className={'inline-avatar'}
                        >
                            <Avatar src={author.avatar_url} size={20} className={'avatar-small'} />
                        </Tooltip>
                        <Tooltip
                            aria-label={copyBranchStatus ? '✔️ Copied' : '📋 Copy branch name to clipboard'}
                            direction="n"
                        >
                            <BranchName
                                as={'span'}
                                sx={{ mr: 2 }}
                                className={'mrBranchName'}
                                title={mr.source_branch}
                                onClick={() => copyToClipboard(mr.source_branch)}
                            >
                                <GitMergeIcon /> {mr.references.full}
                            </BranchName>
                        </Tooltip>
                        {mr.merge_status === 'can_be_merged' && mr.approvals.approved ? (
                            <Label
                                size="small"
                                sx={{ color: 'canvas.default', bg: 'success.emphasis' }}
                                className={'mrLabel'}
                                title="Approved and can be merged!"
                            >
                                <IssueClosedIcon />
                            </Label>
                        ) : null}
                        {mr.merge_status !== 'can_be_merged' && mr.approvals.approved ? (
                            <Label
                                size="small"
                                sx={{ color: 'canvas.default', bg: 'attention.emphasis' }}
                                className={'mrLabel'}
                                title="Approved but you may need to rebase before merging."
                            >
                                <IssueOpenedIcon />
                            </Label>
                        ) : null}
                        {mr.merge_status !== 'can_be_merged' && !mr.approvals.approved ? (
                            <Label
                                size="small"
                                sx={{ color: 'canvas.default', bg: 'danger.emphasis' }}
                                className={'mrLabel'}
                                title="Cannot be merged, you may need to rebase first."
                            >
                                <IssueOpenedIcon />
                            </Label>
                        ) : null}
                        <Label
                            size="small"
                            sx={{ color: 'neutral.emphasis', bg: 'canvas.default' }}
                            className={'mrLabel'}
                        >
                            <CommentDiscussionIcon /> &#160;{mr.user_notes_count}
                        </Label>
                        <Label
                            size="small"
                            sx={{ color: 'neutral.emphasis', bg: 'canvas.default' }}
                            className={'mrLabel'}
                        >
                            <ClockIcon /> &#160;{timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box className={'avatarsList'}>
                    {avatarsUI}{' '}
                    {reviewers.length > 3 ? (
                        <Tooltip
                            className={'moreAssigneesIcon'}
                            aria-label={`and ${reviewers.length - 3} more`}
                            direction="w"
                        >
                            <PlusIcon />
                        </Tooltip>
                    ) : (
                        ''
                    )}
                </Box>
            </Box>
        </FilterList.Item>
    );
};

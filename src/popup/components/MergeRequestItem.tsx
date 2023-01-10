import { useState } from 'react';
import { Avatar, BranchName, FilterList, Box, Link, Label, Tooltip } from '@primer/react';
import { GitMergeIcon, ClockIcon, CommentDiscussionIcon, PlusIcon } from '@primer/octicons-react';
import { AvatarWithTooltip, UserWithApproval } from './AvatarWithTooltip';
import { calculateTimeElapsed, cleanupDescription, removeDuplicateObjectFromArray } from '../helpers';
import { GitlabTypes, MergeRequestsDetails } from '../../background/types';
import { createNewTab } from '../utils/createNewTab';
import { PipelineBadge } from './PipelineBadge';
import { MergeBadge } from './MergeBadge';

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
    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopyBranchStatus(true);
    };

    const author = mr.author as GitlabTypes.UserSchema;
    const reviewers = removeDuplicateObjectFromArray([...(mr.assignees ?? []), ...(mr.reviewers ?? [])], 'id');

    const avatars = reviewers
        .map((assignee) => {
            // In TS spread operator loses the typing. Because of Omit
            // I am not sure loses even more. Resulting type is { approve: boolean | undefined}
            // Because assignee is type of Omit<GitlabTypes.UserSchema, 'created_at'>
            // it is safe to cast output type to a UserWithApproval type
            return {
                ...assignee,
                approved:
                    mr.approvals &&
                    mr.approvals.approved_by &&
                    mr.approvals.approved_by.filter((approval) => {
                        return approval.user.id === assignee.id;
                    }).length > 0
            } as UserWithApproval;
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
                        onClick={(event: React.MouseEvent<HTMLElement>) => createNewTab(event, mr.web_url)}
                        className={'mrTitle'}
                        sx={{ color: mr.approvals.approved ? 'success.fg' : 'fg.default' }}
                        title={`${mr.title} - ${author.name}\n\n${cleanupDescription(mr.description)}`}
                    >
                        {mr.title}
                    </Link>
                    <Box display="flex">
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
                            direction="e"
                            className={'mrBranchNameParent'}
                            sx={{ mr: 2 }}
                        >
                            <BranchName
                                as={'span'}
                                className={'mrBranchName'}
                                title={mr.source_branch}
                                onClick={async () => await copyToClipboard(mr.source_branch)}
                            >
                                <GitMergeIcon /> {mr.references.full}
                            </BranchName>
                        </Tooltip>
                        <PipelineBadge pipeline={mr.pipeline} />
                        <MergeBadge mergeStatus={mr.merge_status} mrApproved={Boolean(mr.approvals.approved)} />
                        <Label
                            size="small"
                            sx={{
                                color: mr.blocking_discussions_resolved ? 'neutral.emphasis' : 'canvas.default',
                                bg: mr.blocking_discussions_resolved ? 'canvas.default' : '#fd7e14'
                            }}
                            className={'mrLabel'}
                            title={
                                mr.blocking_discussions_resolved
                                    ? 'All threads are resolved'
                                    : 'Some threads are not resolved yet.'
                            }
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
                    </Box>
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

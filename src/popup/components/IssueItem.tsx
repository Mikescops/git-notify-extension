import { Avatar, BranchName, FilterList, Box, Button, Link, Label, Tooltip } from '@primer/react';
import { ClockIcon, CommentDiscussionIcon, PlusIcon, RepoIcon } from '@primer/octicons-react';
import { AvatarWithTooltip } from './AvatarWithTooltip';
import { calculateTimeElapsed } from '../helpers';
import { GitlabTypes } from '../../background/types';
import { createNewTab } from '../utils/createNewTab';

interface Props {
    issue: GitlabTypes.IssueSchema;
}

export const IssueItem = ({ issue }: Props) => {
    const timeElapsed = calculateTimeElapsed(issue.created_at);

    const author = issue.author as GitlabTypes.UserSchema;
    const assignees = issue.assignees as GitlabTypes.UserSchema[];
    const avatars =
        assignees &&
        assignees.slice(0, 3).map((assigneeRaw) => {
            const assignee = assigneeRaw as GitlabTypes.UserSchema;
            return <AvatarWithTooltip assignee={assignee} key={assignee.id} />;
        });

    return (
        <FilterList.Item className={'mrItem'}>
            <Box display="flex" flexWrap="nowrap">
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={issue.web_url}
                        onClick={(event: React.MouseEvent<HTMLElement>) => createNewTab(event, issue.web_url)}
                        className={'mrTitle'}
                        sx={{ color: 'fg.default' }}
                        title={`${issue.title} - ${author.name}\n${issue.description}`}
                    >
                        {issue.title}
                    </Link>
                    <div>
                        <Tooltip sx={{ mr: 2 }} aria-label={author.name} direction="e" className={'inline-avatar'}>
                            <Avatar src={author.avatar_url} size={20} className={'avatar-small'} />
                        </Tooltip>
                        <BranchName as={Button} sx={{ mr: 2 }} className={'mrBranchName'}>
                            <RepoIcon /> {issue.references.full}
                        </BranchName>
                        <Label
                            size="small"
                            sx={{ color: 'neutral.emphasis', bg: 'canvas.default' }}
                            className={'mrLabel'}
                        >
                            <CommentDiscussionIcon /> {issue.user_notes_count}
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
                    {avatars}{' '}
                    {assignees.length > 3 ? (
                        <Tooltip
                            className={'moreAssigneesIcon'}
                            aria-label={`and ${assignees.length - 3} more`}
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

import { Avatar, FilterList, Box, Link, Label, Tooltip } from '@primer/react';
import { ClockIcon, CommentDiscussionIcon, PlusIcon } from '@primer/octicons-react';
import { AvatarWithTooltip } from './AvatarWithTooltip';
import { calculateTimeElapsed } from '../helpers';
import { GitlabTypes } from '../../background/types';
import { createNewTab } from '../utils/createNewTab';
import { ProjectName } from './ProjectName';

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
                    <Box display="flex">
                        <Tooltip sx={{ mr: 2 }} aria-label={author.name} direction="e" className={'inline-avatar'}>
                            <Avatar src={author.avatar_url} size={20} className={'avatar-small'} />
                        </Tooltip>
                        <ProjectName
                            textToCopy={issue.references.full}
                            projectName={issue.references.full}
                            label={'issue reference'}
                        />
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
                    </Box>
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

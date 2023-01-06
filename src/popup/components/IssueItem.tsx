import React, { useState } from 'react';
import {
    Avatar,
    BranchName,
    FilterList,
    Heading,
    Box,
    Button,
    Link,
    Label,
    Popover,
    Text,
    Tooltip
} from '@primer/react';
import MarkdownIt from 'markdown-it';
import MardownItSanitizer from 'markdown-it-sanitizer';
import { ClockIcon, CommentDiscussionIcon, PlusIcon, RepoIcon } from '@primer/octicons-react';
import { AvatarWithTooltip } from './AvatarWithTooltip';
import { calculateTimeElapsed } from '../helpers';
import { GitlabTypes } from '../../background/types';

interface Props {
    issue: GitlabTypes.IssueSchema;
}

const md = new MarkdownIt({ linkify: true, html: true }).use(MardownItSanitizer);

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
    const labels = issue.labels?.map((label) => {
        return <Label key={label}>{label}</Label>;
    });

    const [displayIssueDetails, setDisplayIssueDetails] = useState(false);

    return (
        <FilterList.Item className={'mrItem'}>
            <Box display="flex" flexWrap="nowrap">
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={issue.web_url}
                        className={'mrTitle'}
                        target="_blank"
                        sx={{ color: 'fg.default' }}
                        onMouseOver={() => setDisplayIssueDetails(true)}
                        onMouseOut={() => setDisplayIssueDetails(false)}
                    >
                        {issue.title}
                    </Link>
                    <Popover open={displayIssueDetails} caret="top-left">
                        <Popover.Content sx={{ mt: 2 }} className={'popoverContent'}>
                            <Heading sx={{ fontSize: 2 }}>
                                {issue.title} - {author.name}
                            </Heading>
                            {labels}
                            <Text as="p" dangerouslySetInnerHTML={{ __html: md.render(issue.description) }} />
                        </Popover.Content>
                    </Popover>
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

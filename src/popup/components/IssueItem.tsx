import { Avatar, ActionList, Box, Link, Label, Tooltip, Button, Details, IconButton, useDetails } from '@primer/react';
import { ChevronDownIcon, ChevronRightIcon, ClockIcon, CommentDiscussionIcon, PlusIcon } from '@primer/octicons-react';
import { AvatarWithTooltip } from './AvatarWithTooltip';
import { calculateTimeElapsed, cleanupDescription } from '../helpers';
import { GitlabTypes } from '../../background/types';
import { createNewTab } from '../utils/createNewTab';
import { ProjectName } from './ProjectName';
import { MarkdownViewer } from '@primer/react/lib-esm/drafts';
import { marked } from 'marked';

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
    const labels = issue.labels?.map((label) => {
        return (
            <Label sx={{ m: 0.8 }} key={label}>
                {label.replace('::', ' | ')}
            </Label>
        );
    });

    const { getDetailsProps, open, setOpen } = useDetails({
        closeOnOutsideClick: true
    });

    return (
        <ActionList.Item className={'mrItem'}>
            <Box display="flex" flexWrap="wrap">
                <Box mr={2} display={'flex'} flexWrap="wrap" flex={1}>
                    <IconButton
                        as="div"
                        variant="invisible"
                        size="small"
                        className={'mrIconButton'}
                        onClick={(e) => {
                            e.preventDefault();
                            setOpen(!open ?? true);
                        }}
                        icon={open ? ChevronDownIcon : ChevronRightIcon}
                        aria-labelledby="icon-button-label"
                    />
                    <Link
                        as="a"
                        href={issue.web_url}
                        onClick={(event: React.MouseEvent<HTMLElement>) => createNewTab(event, issue.web_url)}
                        className={'mrTitle'}
                        sx={{ color: 'fg.default' }}
                        title={`${issue.title} - ${author.name}\n${cleanupDescription(issue.description)}`}
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
                            <CommentDiscussionIcon /> &#160;{issue.user_notes_count}
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
                <Details {...getDetailsProps()} sx={{ width: '100%' }}>
                    <Button as="summary" sx={{ display: 'none' }} hidden={true}>
                        hidden
                    </Button>
                    <Box className={'markdownContent'} sx={{ bg: 'neutral.subtle' }}>
                        <MarkdownViewer
                            openLinksInNewTab={true}
                            dangerousRenderedHTML={{ __html: marked.parse(cleanupDescription(issue.description)) }}
                        />
                        <br />
                        {labels}
                    </Box>
                </Details>
            </Box>
        </ActionList.Item>
    );
};

import { Avatar, ActionList, Box, Link, Label, Tooltip, Details, useDetails, IconButton, Button } from '@primer/react';
import { ChevronDownIcon, ChevronRightIcon, ClockIcon, CommentDiscussionIcon, PlusIcon } from '@primer/octicons-react';
import { AvatarWithTooltip, UserWithApproval } from './AvatarWithTooltip';
import { calculateTimeElapsed, cleanupDescription, removeDuplicateObjectFromArray } from '../helpers';
import { createNewTab } from '../utils/createNewTab';
import { PipelineBadge } from './PipelineBadge';
import { MergeBadge } from './MergeBadge';
import { ProjectName } from './ProjectName';
import { MarkdownViewer } from '@primer/react/drafts';
import { marked } from 'marked';
import { UserSchema } from '@gitbeaker/rest';
import { MergeRequestsDetails } from '../../common/types';

interface Props {
    mr: MergeRequestsDetails;
}

export const MergeRequestItem = ({ mr }: Props) => {
    let mrApproved = false;
    if (mr.approvals.user_has_approved) {
        mrApproved = true;
    }

    const timeElapsed = calculateTimeElapsed(mr.created_at);

    const author = mr.author as UserSchema;
    const reviewers = removeDuplicateObjectFromArray([...(mr.assignees ?? []), ...(mr.reviewers ?? [])], 'id');

    const avatars = reviewers
        .map((assignee) => {
            // In TS spread operator loses the typing. Because of Omit
            // I am not sure loses even more. Resulting type is { approve: boolean | undefined}
            // Because assignee is type of Omit<UserSchema, 'created_at'>
            // it is safe to cast output type to a UserWithApproval type
            return {
                ...assignee,
                approved:
                    mr.approvals &&
                    mr.approvals.approved_by &&
                    mr.approvals.approved_by?.filter((approval) => {
                        return approval.user.id === assignee.id;
                    }).length > 0
            } as UserWithApproval;
        })
        .sort((a, b) => Number(b.approved) - Number(a.approved))
        .slice(0, 3);

    const avatarsUI = avatars.map((assignee) => <AvatarWithTooltip assignee={assignee} key={assignee.id} />);

    const { getDetailsProps, open, setOpen } = useDetails({
        closeOnOutsideClick: true
    });

    return (
        <ActionList.Item className={mrApproved ? 'mrApproved mrItem' : 'mrItem'}>
            <Box display="flex" flexWrap="wrap">
                <Box mr={2} display={'flex'} flexWrap="wrap" flex={1}>
                    <IconButton
                        as="div"
                        variant="invisible"
                        size="small"
                        className={'mrIconButton'}
                        onClick={(e) => {
                            e.preventDefault();
                            setOpen(!(open ?? false));
                        }}
                        icon={open ? ChevronDownIcon : ChevronRightIcon}
                        aria-labelledby="icon-button-label"
                    />
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
                        <ProjectName
                            textToCopy={mr.source_branch}
                            projectName={mr.references.full}
                            label={'branch name'}
                        />
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
                <Box display={'flex'} className={'avatarsList'}>
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
                <Box flexBasis={'100%'} width={0}></Box>
                <Details {...getDetailsProps()} sx={{ width: '100%' }}>
                    <Button as="summary" sx={{ display: 'none' }} hidden={true}>
                        hidden
                    </Button>
                    <Box className={'markdownContent'} sx={{ bg: 'neutral.subtle' }}>
                        <MarkdownViewer
                            openLinksInNewTab={true}
                            dangerousRenderedHTML={{ __html: marked.parse(cleanupDescription(mr.description)) }}
                        />
                    </Box>
                </Details>
            </Box>
        </ActionList.Item>
    );
};

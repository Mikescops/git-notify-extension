import React from 'react';
import { BranchName, FilterList, Flex, Box, Link, Label } from '@primer/components';
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

    const avatars = mr.assignees
        .slice(0, 3)
        .map((assignee) => <AvatarWithTooltip mr={mr} assignee={assignee} key={assignee.id} />);

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
                        {mr.title} - {mr.author.name}
                    </Link>
                    <div>
                        <BranchName as="span" mr={2} className={'mrBranchName'} title={mr.source_branch}>
                            <Octicon icon={GitMerge} /> {mr.source_branch}
                        </BranchName>
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
                            <Octicon icon={CommentDiscussion} /> {mr.comments.length}
                        </Label>
                        <Label variant="medium" bg="white" color="#8e8e8e" className={'mrLabel'}>
                            <Octicon icon={Clock} /> {timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box className={'avatarsList'}>
                    {avatars}
                    {mr.assignees.length > 3 ? <Octicon icon={Plus} /> : ''}
                </Box>
            </Flex>
        </FilterList.Item>
    );
};

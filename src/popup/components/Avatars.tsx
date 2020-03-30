import React from 'react';
import { Avatar, Tooltip } from '@primer/components';
import Octicon, { Check } from '@primer/octicons-react';
import { MergeRequestsDetails, User } from '../../background/types';

interface Props {
    mr: MergeRequestsDetails;
    assignee: User;
}

export const Avatars = (props: Props) => {
    const { mr, assignee } = props;

    let approved = null;
    if (
        mr.approvals.approved_by.filter(function (e) {
            return e.user.id === assignee.id;
        }).length > 0
    ) {
        approved = (
            <div className={'statusMark'}>
                <Octicon icon={Check} />
            </div>
        );
    }

    return (
        <Tooltip className={'userAvatar'} aria-label={assignee.name} direction="w">
            {approved}
            <Avatar src={assignee.avatar_url} alt={assignee.name} size={40} mr={2} />
        </Tooltip>
    );
};

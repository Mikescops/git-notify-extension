import React from 'react';
import { Avatar, Tooltip } from '@primer/components';
import Octicon, { Check } from '@primer/octicons-react';
import { User } from '../../background/types';

interface UserWithApproval extends User {
    approved?: boolean;
}

interface Props {
    assignee: UserWithApproval;
}

export const AvatarWithTooltip = (props: Props) => {
    const { assignee } = props;

    const approvedMark = (
        <div className={'statusMark'}>
            <Octicon icon={Check} />
        </div>
    );

    return (
        <Tooltip className={'userAvatar'} aria-label={assignee.name} direction="w">
            {assignee.approved ? approvedMark : null}
            <Avatar src={assignee.avatar_url} alt={assignee.name} size={40} mr={2} />
        </Tooltip>
    );
};

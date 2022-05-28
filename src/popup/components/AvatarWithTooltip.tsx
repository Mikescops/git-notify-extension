import React from 'react';
import { Avatar, Tooltip } from '@primer/react';
import { CheckIcon } from '@primer/octicons-react';
import { GitlabTypes } from '../../background/types';

interface UserWithApproval extends GitlabTypes.UserSchema {
    approved?: boolean;
}

interface Props {
    assignee: UserWithApproval;
    direction?: 'n' | 'e' | 's' | 'w';
    size?: number;
}

export const AvatarWithTooltip = (props: Props) => {
    const { assignee } = props;

    const approvedMark = (
        <div className={'statusMark'}>
            <CheckIcon />
        </div>
    );

    return (
        <Tooltip className={'userAvatar'} aria-label={assignee.name} direction={props.direction ?? 'w'}>
            {assignee.approved ? approvedMark : null}
            <Avatar src={assignee.avatar_url} alt={assignee.name} square size={props.size ?? 40} sx={{ mr: 1 }} />
        </Tooltip>
    );
};

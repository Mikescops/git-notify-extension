import { Avatar, Tooltip } from '@primer/react';
import { CheckIcon } from '@primer/octicons-react';
import { UserSchema } from '@gitbeaker/rest';

export interface UserWithApproval extends UserSchema {
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

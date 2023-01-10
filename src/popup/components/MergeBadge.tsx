import { Label } from '@primer/react';
import { GitMergeIcon, GitPullRequestDraftIcon, GitPullRequestClosedIcon } from '@primer/octicons-react';
import { GitlabTypes } from '../../background/types';

interface Props {
    mergeStatus: GitlabTypes.MergeRequestSchema['merge_status'];
    mrApproved: boolean;
}

export const MergeBadge = (props: Props) => {
    const { mergeStatus, mrApproved } = props;

    let bg = 'danger.emphasis';
    let title = 'Cannot be merged, you may need to rebase first.';
    let icon = <GitPullRequestClosedIcon />;

    if (mergeStatus === 'can_be_merged' && mrApproved) {
        bg = 'success.emphasis';
        title = 'Approved and mergeable!';
        icon = <GitMergeIcon />;
    }

    if (mergeStatus !== 'can_be_merged' && mrApproved) {
        bg = 'attention.emphasis';
        title = 'Approved but you may need to rebase before merging.';
        icon = <GitPullRequestDraftIcon />;
    }

    if (mergeStatus !== 'can_be_merged' && !mrApproved) {
        return (
            <Label size="small" sx={{ color: 'canvas.default', bg }} className={'mrLabel'} title={title}>
                {icon}
            </Label>
        );
    }

    return <></>;
};

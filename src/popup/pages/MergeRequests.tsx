import { ActionList } from '@primer/react';
import { EmptyItems } from '../components/EmptyItems';
import { MergeRequestItem } from '../components/MergeRequestItem';
import { MergeRequestsDetails } from '../../common/types';

interface Props {
    mergeRequests: MergeRequestsDetails[];
}

export const MergeRequests = (props: Props): JSX.Element => {
    const { mergeRequests } = props;
    if (!mergeRequests || mergeRequests.length === 0) {
        return <EmptyItems />;
    }

    return (
        <ActionList className={'mrList'}>
            {mergeRequests.map((mr: MergeRequestsDetails) => (
                <MergeRequestItem mr={mr} key={mr.id} />
            ))}
        </ActionList>
    );
};

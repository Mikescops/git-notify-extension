import { ActionList } from '@primer/react';
import { EmptyItems } from '../components/EmptyItems';
import { IssueItem } from '../components/IssueItem';
import { IssueSchema } from '@gitbeaker/rest';

interface Props {
    issues: IssueSchema[];
}

export const Issues = (props: Props): JSX.Element => {
    if (!props.issues || props.issues.length === 0) {
        return <EmptyItems />;
    }
    return (
        <ActionList className={'mrList'}>
            {props.issues.map((issue: IssueSchema) => (
                <IssueItem issue={issue} key={issue.id} />
            ))}
        </ActionList>
    );
};

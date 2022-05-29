import React from 'react';
import { FilterList } from '@primer/react';
import { GitlabTypes } from '../../background/types';
import { EmptyItems } from '../components/EmptyItems';
import { IssueItem } from '../components/IssueItem';

interface Props {
    issues: GitlabTypes.IssueSchema[];
}

export const Issues = (props: Props): JSX.Element => {
    if (!props.issues || props.issues.length === 0) {
        return <EmptyItems />;
    }
    return (
        <FilterList className={'mrList'}>
            {props.issues.map((issue: GitlabTypes.IssueSchema) => (
                <IssueItem issue={issue} key={issue.id} />
            ))}
        </FilterList>
    );
};

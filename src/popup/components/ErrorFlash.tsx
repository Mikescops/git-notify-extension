import React from 'react';
import { Details, Flash } from '@primer/react';

interface Props {
    message: string;
    stack: string;
}

export const ErrorFlash = (props: Props): JSX.Element => {
    return (
        <Flash sx={{ margin: 2 }} variant="danger">
            {props.message}
            <Details>{props.stack}</Details>
        </Flash>
    );
};

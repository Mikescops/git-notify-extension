import { Details, Flash, FlashProps } from '@primer/react';

interface Props extends FlashProps {
    error: Error;
}

export const ErrorFlash = (props: Props): JSX.Element => {
    const { error, ...other } = props;

    return (
        <Flash sx={{ margin: 2 }} variant="danger" {...other}>
            {error.message}
            <Details style={{ whiteSpace: 'normal' }}>{error.stack}</Details>
        </Flash>
    );
};

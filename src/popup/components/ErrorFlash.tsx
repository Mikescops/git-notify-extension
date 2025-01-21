import { Details, Flash, FlashProps, Text } from '@primer/react';

interface Props extends FlashProps {
    error: Error;
    accountUuid?: string;
}

export const ErrorFlash = (props: Props): JSX.Element => {
    const { error, ...other } = props;

    return (
        <Flash sx={{ margin: 2 }} variant="danger" {...other}>
            {props.accountUuid && (
                <>
                    <Text sx={{ fontWeight: 'bold' }}>Account: {props.accountUuid}</Text> <br />
                </>
            )}
            <Text>{error.message}</Text>
            <Details style={{ whiteSpace: 'normal' }}>{error.stack}</Details>
        </Flash>
    );
};

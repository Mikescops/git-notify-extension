import { Box, Spinner } from '@primer/react';

export const Loading = () => {
    return (
        <Box
            display="flex"
            flexWrap="nowrap"
            sx={{ height: 320, overflowY: 'auto', alignItems: 'center', justifyContent: 'center' }}
        >
            <Spinner size="large" />
        </Box>
    );
};

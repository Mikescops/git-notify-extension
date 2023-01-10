import { Label, useTheme } from '@primer/react';
import { CheckIcon, XIcon, IterationsIcon } from '@primer/octicons-react';
import { GitlabTypes } from '../../background/types';
import { createNewTab } from '../utils/createNewTab';

interface Props {
    pipeline?: GitlabTypes.PipelineSchema;
}

export const PipelineBadge = (props: Props) => {
    const { pipeline } = props;
    const { theme } = useTheme();

    if (!pipeline) {
        return <></>;
    }

    let bg = 'attention.emphasis';
    let title = `Pipeline is ${pipeline.status}`;
    let icon = <IterationsIcon />;

    if (pipeline.status === 'success') {
        bg = 'success.emphasis';
        title = 'Pipeline succeeded';
        icon = <CheckIcon />;
    }

    if (pipeline.status === 'failed') {
        bg = 'danger.emphasis';
        title = 'Pipeline failed';
        icon = <XIcon />;
    }

    const bgSplit = bg.split('.');

    return (
        <Label
            size="small"
            sx={{
                'color': 'canvas.default',
                bg,
                'padding': '0 3px',
                'cursor': 'pointer',
                ':hover': { boxShadow: `0px 0px 5px 0px ${theme?.colors[bgSplit[0]][bgSplit[1]]};` }
            }}
            className={'mrLabel'}
            title={title}
            onClick={(event) => createNewTab(event, pipeline.web_url)}
        >
            {icon}
        </Label>
    );
};

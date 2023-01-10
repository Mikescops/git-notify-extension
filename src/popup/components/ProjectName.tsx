import { useCallback, useEffect, useState } from 'react';
import { RepoIcon } from '@primer/octicons-react';
import { Tooltip, BranchName } from '@primer/react';
import { readConfiguration } from '../../common/configuration';

interface Props {
    textToCopy: string;
    label?: string;
    projectName: string;
}

export const ProjectName = (props: Props) => {
    const [copyBranchStatus, setCopyBranchStatus] = useState(false);
    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopyBranchStatus(true);
    };

    const [projectDirectoryPrefix, setProjectDirectoryPrefix] = useState<string>('');

    const settings = useCallback(() => {
        const getSettings = readConfiguration(['projectDirectoryPrefix']);
        getSettings.then((settings) => {
            setProjectDirectoryPrefix(settings.projectDirectoryPrefix ?? '');
        });
    }, []);

    useEffect(() => settings(), [settings]);

    console.log(projectDirectoryPrefix);

    return (
        <Tooltip
            aria-label={copyBranchStatus ? '✔️ Copied' : `📋 Copy ${props.label ?? 'name'} to clipboard`}
            direction="e"
            className={'mrBranchNameParent'}
            sx={{ mr: 2 }}
        >
            <BranchName
                as={'span'}
                className={'mrBranchName'}
                title={props.textToCopy}
                onClick={async () => await copyToClipboard(props.textToCopy)}
            >
                <RepoIcon /> {props.projectName.replace(projectDirectoryPrefix, '')}
            </BranchName>
        </Tooltip>
    );
};

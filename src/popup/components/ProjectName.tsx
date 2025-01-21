import { useCallback, useEffect, useState } from 'react';
import { RepoIcon } from '@primer/octicons-react';
import { Tooltip, BranchName } from '@primer/react';
import { getConfiguration } from '../../common/storage';

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
        const getSettings = getConfiguration(['accounts']);
        getSettings.then((settings) => {
            setProjectDirectoryPrefix(settings.accounts[0].projectDirectoryPrefix ?? '');
        });
    }, []);

    useEffect(() => settings(), [settings]);

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

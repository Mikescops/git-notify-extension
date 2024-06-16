import * as browser from 'webextension-polyfill';
import { useCallback, useState } from 'react';
import {
    InfoIcon,
    KeyIcon,
    CheckIcon,
    ServerIcon,
    FileDirectoryIcon,
    PackageDependenciesIcon
} from '@primer/octicons-react';
import { Button, Checkbox, FormControl, Link, Octicon, TextInput, Tooltip, Text } from '@primer/react';
import { Account } from '../../common/types';
import { updateAccountConfiguration } from '../../common/configuration';

interface Props {
    accountIndex: number;
    account: Account;
}

export const AccountConfiguration = (props: Props) => {
    const [testSuccess, setTestSuccess] = useState(null);

    const [account, setAccount] = useState<Account>(props.account);

    const setAccountConfiguration = async (data: Partial<Account>) => {
        await updateAccountConfiguration(props.accountIndex, data);
        setAccount({ ...account, ...data });
    };

    const testConnection = useCallback(() => {
        browser.runtime.sendMessage({ type: 'getLatestDataFromGitLab' }).then((success) => setTestSuccess(success));
    }, []);

    return (
        <>
            <FormControl>
                <FormControl.Label>Using GitLab Community Edition</FormControl.Label>
                <Checkbox
                    type="checkbox"
                    name="gitlabCE"
                    value="GitLab CE Mode"
                    onChange={(e) => setAccountConfiguration({ gitlabCE: e.target.checked })}
                    checked={account.gitlabCE}
                />
                <FormControl.Caption>(approvals are a premium feature)</FormControl.Caption>
            </FormControl>
            <FormControl>
                <FormControl.Label>
                    Personal GitLab Token{' '}
                    <Link href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html" target="_blank">
                        <Tooltip
                            wrap={true}
                            aria-label="Click to open GitLab documentation.
                    The extension requires 'api' right (or just 'read_api' but all write operations will fail)."
                        >
                            <Octicon icon={InfoIcon} size={15} color="blue.5" />
                        </Tooltip>
                    </Link>
                </FormControl.Label>
                <TextInput
                    type="password"
                    leadingVisual={KeyIcon}
                    trailingVisual={account.token ? CheckIcon : undefined}
                    block
                    name="gitlab-token"
                    value={account.token}
                    placeholder="<your_token_here>"
                    onChange={(e) => setAccountConfiguration({ token: e.target.value })}
                    aria-label="gitlab-token"
                />
            </FormControl>
            <FormControl>
                <FormControl.Label>
                    GitLab Host Address{' '}
                    <Tooltip aria-label="Example: https://gitlab.com">
                        <Octicon icon={InfoIcon} size={15} color="blue.5" />
                    </Tooltip>
                </FormControl.Label>
                <TextInput
                    leadingVisual={ServerIcon}
                    trailingVisual={account.address ? CheckIcon : undefined}
                    block
                    name="gitlab-address"
                    value={account.address}
                    placeholder="<host_address_here>"
                    onChange={(e) => setAccountConfiguration({ address: e.target.value })}
                    aria-label="gitlab-address"
                />
            </FormControl>
            <FormControl>
                <FormControl.Label>View draft MRs in &quot;To Review&quot; tab</FormControl.Label>
                <Checkbox
                    type="checkbox"
                    name="draftInToReviewTab"
                    value="View draft in To Review tab"
                    onChange={(e) => setAccountConfiguration({ draftInToReviewTab: e.target.checked })}
                    checked={account.draftInToReviewTab}
                />
                <FormControl.Caption>
                    (merge requests marked as &quot;Draft:&quot; will be ignored if unchecked)
                </FormControl.Caption>
            </FormControl>
            <FormControl>
                <FormControl.Label>
                    Projects directory prefix{' '}
                    <Tooltip
                        aria-label="Sometimes your project are in a sub-directory like 'teams/code/projects/'
                            which makes the project name difficult to read.
                            Set a prefix here that will be substitute each time."
                    >
                        <Octicon icon={InfoIcon} size={15} color="blue.5" />
                    </Tooltip>
                </FormControl.Label>
                <TextInput
                    leadingVisual={FileDirectoryIcon}
                    block
                    name="project-directory-prefix"
                    value={account.projectDirectoryPrefix}
                    trailingVisual={account.projectDirectoryPrefix ? CheckIcon : undefined}
                    placeholder="teams/code/projects/"
                    onChange={(e) => setAccountConfiguration({ projectDirectoryPrefix: e.target.value })}
                    aria-label="project-directory-prefix"
                />
            </FormControl>

            <>
                <Button onClick={testConnection} block variant="default">
                    <PackageDependenciesIcon /> Test my settings
                </Button>
                <Text
                    opacity={testSuccess === null ? 0 : 100}
                    sx={{
                        color: testSuccess === true ? 'success.fg' : 'danger.fg',
                        fontSize: 18,
                        textAlign: 'center'
                    }}
                >
                    {testSuccess === true ? 'Success' : 'Could not connect'}
                </Text>
            </>
        </>
    );
};

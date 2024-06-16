import { Gitlab } from '@gitbeaker/rest';
import { GitLabAddressNotSet, GitLabTokenNotSet, NoAccountSet } from '../../common/errors';
import { FailFetchSettings } from '../errors';
import { GetSettingsResponse, GitlabAPI } from '../types';

export const initGitlabApi = (settings: GetSettingsResponse): GitlabAPI => {
    if (!settings) {
        throw new FailFetchSettings();
    }

    if (!settings.accounts) {
        throw new NoAccountSet();
    }

    const account = settings.accounts[0];

    if (!account.token || account.token === '') {
        throw new GitLabTokenNotSet();
    }

    if (!account.address || account.address === '') {
        throw new GitLabAddressNotSet();
    }

    account.address = account.address.replace(/\/$/, '');
    if (!account.address.startsWith('http')) {
        account.address = `https://${account.address}`;
    }

    return new Gitlab({
        host: account.address,
        token: account.token,
        queryTimeout: 10000
    });
};

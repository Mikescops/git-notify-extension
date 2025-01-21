import { Gitlab } from '@gitbeaker/rest';
import { GitLabAddressNotSet, GitLabTokenNotSet } from '../../common/errors';
import { Account, GitlabAPI } from '../../common/types';

interface InitGitlabApiParams {
    account: Account;
}

export const initGitlabApi = (params: InitGitlabApiParams): GitlabAPI => {
    const { account } = params;

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

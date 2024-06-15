import { Gitlab } from '@gitbeaker/rest';
import { GitLabAddressNotSet, GitLabTokenNotSet } from '../../common/errors';
import { FailFetchSettings } from '../errors';
import { GetSettingsResponse, GitlabAPI } from '../types';

export const initGitlabApi = (settings: GetSettingsResponse): GitlabAPI => {
    if (!settings) {
        throw new FailFetchSettings();
    }

    if (!settings.token) {
        throw new GitLabTokenNotSet();
    }

    if (!settings.address) {
        throw new GitLabAddressNotSet();
    }

    settings.address = settings.address.replace(/\/$/, '');
    if (!settings.address.startsWith('http')) {
        settings.address = `https://${settings.address}`;
    }

    return new Gitlab({
        host: settings.address,
        token: settings.token,
        queryTimeout: 10000
    });
};

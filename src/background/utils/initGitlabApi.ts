import { Gitlab } from '@gitbeaker/browser';
import { FailFetchSettings, GitLabTokenNotSet, GitLabAddressNotSet } from '../errors';
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

    return new Gitlab({
        host: settings.address,
        token: settings.token,
        requestTimeout: 10000
    });
};

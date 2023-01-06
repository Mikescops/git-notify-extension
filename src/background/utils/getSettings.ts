import * as browser from 'webextension-polyfill';
import { config } from '../../config/config';
import { GetSettingsResponse } from '../types';

/**
 * During dev address and token are pulled from the config files in order to save time
 */
export const getSettings = async (): Promise<GetSettingsResponse> => {
    if (config.mode === 'production') {
        const settings = await browser.storage.local.get([
            'gitlabCE',
            'gitlabToken',
            'gitlabAddress',
            'alertBadgeCounters'
        ]);
        return {
            token: settings.gitlabToken,
            address: settings.gitlabAddress,
            gitlabCE: settings.gitlabCE || false,
            alertBadgeCounters: settings.alertBadgeCounters || [0]
        };
    }

    const { token, address } = config;
    const settings = await browser.storage.local.get(['gitlabCE', 'alertBadgeCounters']);
    return {
        token,
        address,
        gitlabCE: settings.gitlabCE || false,
        alertBadgeCounters: settings.alertBadgeCounters || [0]
    };
};

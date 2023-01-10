import * as browser from 'webextension-polyfill';
import { config } from '../../config/config';
import { GetSettingsResponse } from '../types';

/**
 * During dev address and token are pulled from the config files in order to save time
 */
export const getSettings = async (): Promise<GetSettingsResponse> => {
    const settings = await browser.storage.local.get([
        'gitlabCE',
        'gitlabToken',
        'gitlabAddress',
        'alertBadgeCounters'
    ]);

    if (config.mode === 'production') {
        return {
            token: settings.gitlabToken,
            address: settings.gitlabAddress,
            gitlabCE: Boolean(settings.gitlabCE),
            alertBadgeCounters: settings.alertBadgeCounters || [0]
        };
    }

    const { token, address } = config;
    return {
        token,
        address,
        gitlabCE: Boolean(settings.gitlabCE),
        alertBadgeCounters: settings.alertBadgeCounters || [0]
    };
};

import * as browser from 'webextension-polyfill';
import * as config from '../../config/config';
import { GetSettingsResponse } from '../types';

/**
 * During dev address and token are pulled from the config files in order to save time
 */
export const getSettings = async (): Promise<GetSettingsResponse> => {
    if (config.mode === 'production') {
        return browser.storage.local
            .get(['gitlabCE', 'gitlabToken', 'gitlabAddress', 'alertBadgeCounters'])
            .then((settings) => {
                return {
                    token: settings.gitlabToken,
                    address: settings.gitlabAddress,
                    gitlabCE: settings.gitlabCE || false,
                    alertBadgeCounters: settings.alertBadgeCounters || [0]
                };
            })
            .catch((error) => {
                throw error;
            });
    } else {
        const { token, address } = config;
        return browser.storage.local
            .get(['gitlabCE', 'alertBadgeCounters'])
            .then((settings) => {
                return {
                    token,
                    address,
                    gitlabCE: settings.gitlabCE || false,
                    alertBadgeCounters: settings.alertBadgeCounters || [0]
                };
            })
            .catch((error) => {
                throw error;
            });
    }
};

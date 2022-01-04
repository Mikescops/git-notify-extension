import { browser } from 'webextension-polyfill-ts';
import * as config from '../../config/config';
import { GetSettingsResponse } from '../types';

/**
 * During dev address and token are pulled from the config files in order to save time
 */
export const getSettings = (cb: Callback<GetSettingsResponse>) => {
    if (config.mode === 'production') {
        browser.storage.local
            .get(['gitlabCE', 'gitlabToken', 'gitlabAddress', 'alertBadgeCounters'])
            .then((settings) => {
                return cb(null, {
                    token: settings.gitlabToken,
                    address: settings.gitlabAddress,
                    gitlabCE: settings.gitlabCE || false,
                    alertBadgeCounters: settings.alertBadgeCounters || [0]
                });
            })
            .catch((error) => cb(error));
    } else {
        const { token, address } = config;
        browser.storage.local
            .get(['gitlabCE', 'alertBadgeCounters'])
            .then((settings) => {
                return cb(null, {
                    token,
                    address,
                    gitlabCE: settings.gitlabCE || false,
                    alertBadgeCounters: settings.alertBadgeCounters || [0]
                });
            })
            .catch((error) => cb(error));
    }
};

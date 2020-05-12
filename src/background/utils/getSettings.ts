import { browser } from 'webextension-polyfill-ts';
import * as config from '../../config/config';
import { GetSettingsResponse } from '../types';

export const getSettings = (cb: Callback<GetSettingsResponse>) => {
    if (config.mode === 'production') {
        browser.storage.local.get(['gitlabCE', 'gitlabToken', 'gitlabAddress']).then((settings) => {
            return cb(null, {
                gitlabCE: settings.gitlabCE,
                token: settings.gitlabToken,
                address: settings.gitlabAddress
            });
        });
    } else {
        const { gitlabCE, token, address } = config;
        return cb(null, { gitlabCE, token, address });
    }
};

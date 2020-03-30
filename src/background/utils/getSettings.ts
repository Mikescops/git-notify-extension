import { browser } from 'webextension-polyfill-ts';
import * as config from '../../config/config';
import { GetSettingsResponse } from '../types';

export const getSettings = (cb: Callback<GetSettingsResponse>) => {
    if (config.mode === 'production') {
        browser.storage.local.get(['gitlabToken', 'gitlabAddress']).then((settings) => {
            return cb(null, { token: settings.gitlabToken, address: settings.gitlabAddress });
        });
    } else {
        const { token, address } = config;
        return cb(null, { token, address });
    }
};

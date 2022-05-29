import * as browser from 'webextension-polyfill';

export const setBadge = async (text: string, color: string) => {
    const action = browser.action || browser.browserAction;

    await action.setBadgeText({
        text
    });
    await action.setBadgeBackgroundColor({
        color
    });
    if (typeof action.setBadgeTextColor === 'function') {
        action.setBadgeTextColor({
            color: '#fff'
        });
    }
};

import * as browser from 'webextension-polyfill';

export const setBadge = (text: string, color: string) => {
    const action = browser.action || browser.browserAction;

    action.setBadgeText({
        text
    });
    action.setBadgeBackgroundColor({
        color
    });
    if (typeof action.setBadgeTextColor === 'function') {
        action.setBadgeTextColor({
            color: '#fff'
        });
    }
};

import { browser } from 'webextension-polyfill-ts';

export const setBadge = (text: string, color: string) => {
    let action = browser.browserAction;
    if (browser.action) {
        action = browser.action;
    }

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

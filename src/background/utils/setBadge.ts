import { browser } from 'webextension-polyfill-ts';

export const setBadge = (text: string, color: string) => {
    browser.browserAction.setBadgeText({
        text
    });
    browser.browserAction.setBadgeBackgroundColor({
        color
    });
    if (typeof browser.browserAction.setBadgeTextColor === 'function') {
        browser.browserAction.setBadgeTextColor({
            color: '#fff'
        });
    }
};

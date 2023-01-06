import * as browser from 'webextension-polyfill';

const REQUEST_TYPE_PING = 'ping';

export const pingBackend = async (): Promise<boolean> => {
    return (await browser.runtime.sendMessage({ type: REQUEST_TYPE_PING })) === 'pong';
};

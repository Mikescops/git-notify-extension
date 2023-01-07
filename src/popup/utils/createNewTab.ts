import * as browser from 'webextension-polyfill';

export const createNewTab = (event: React.MouseEvent<HTMLElement>, url: string) => {
    event.preventDefault();
    browser.tabs.create({ url, active: !(event.ctrlKey || event.metaKey) });
};

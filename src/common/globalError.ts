import { GitLabAddressNotSet, GitLabTokenNotSet, GlobalError } from './errors';
import { setBadge } from '../background/utils/setBadge';
import { Storage } from './storage';

export const setGlobalError = async (error: Error | null) => {
    const storage = new Storage();

    if (error) {
        const globalError = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };

        const badgeColor =
            error instanceof GitLabAddressNotSet || error instanceof GitLabTokenNotSet ? 'orange' : 'red';
        await setBadge('!', badgeColor);

        return await storage.setKeys({ globalError: JSON.stringify(globalError) });
    }
    return await storage.removeKey('globalError');
};

export const getGlobalError = async (): Promise<GlobalError> => {
    const storage = new Storage();
    const { globalError } = await storage.getKeys(['globalError']);
    return globalError ? JSON.parse(globalError) : null;
};

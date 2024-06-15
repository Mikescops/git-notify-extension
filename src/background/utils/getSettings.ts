import { GetSettingsResponse } from '../types';
import { readConfiguration } from '../../common/configuration';

/**
 * During dev address and token are pulled from the config files in order to save time
 */
export const getSettings = async (): Promise<GetSettingsResponse> => {
    return readConfiguration(['accounts', 'alertBadgeCounters']);
};

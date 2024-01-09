import { getSettings } from '../utils/getSettings';
import { GitlabTypes } from '../types';
import { initGitlabApi } from '../utils/initGitlabApi';

export const getProjectsList = async (): Promise<GitlabTypes.GroupSchema[]> => {
    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);
    return await gitlabApi.Groups.all({ min_access_level: 30, top_level_only: true, perPage: 100, maxPages: 5 });
};

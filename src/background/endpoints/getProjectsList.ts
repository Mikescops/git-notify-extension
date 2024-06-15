import { getSettings } from '../utils/getSettings';
import { initGitlabApi } from '../utils/initGitlabApi';

export const getProjectsList = async () => {
    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);
    return gitlabApi.Groups.all({ minAccessLevel: 30, topLevelOnly: true, perPage: 100 });
};

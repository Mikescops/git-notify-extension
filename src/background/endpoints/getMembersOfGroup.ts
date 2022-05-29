import { getSettings } from '../utils/getSettings';
import { GitlabTypes } from '../types';
import { initGitlabApi } from '../utils/initGitlabApi';

export const getMembersOfGroup = async (groupId: number): Promise<GitlabTypes.UserSchema[]> => {
    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);
    return await gitlabApi.GroupMembers.all(groupId);
};

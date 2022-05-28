import { getSettings } from '../utils/getSettings';
import { GitlabTypes } from '../types';
import { initGitlabApi } from '../utils/initGitlabApi';

export const pickRandomMemberOfGroup = async (groupId: number): Promise<GitlabTypes.UserSchema[]> => {
    const settings = await getSettings();
    const gitlabApi = await initGitlabApi(settings);
    return await gitlabApi.GroupMembers.all(groupId);
};

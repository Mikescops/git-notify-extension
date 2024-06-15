import { getSettings } from '../utils/getSettings';
import { GroupMember } from '../types';
import { initGitlabApi } from '../utils/initGitlabApi';
import { removeDuplicateObjectFromArray } from '../../popup/helpers';
import { ExpandedMergeRequestSchema, MemberSchema } from '@gitbeaker/rest';

export const getMembersOfGroup = async (groupId: number): Promise<GroupMember[]> => {
    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);
    const groupMembers = (await gitlabApi.GroupMembers.all(groupId)) as MemberSchema[];
    const groupMembersWithCount = groupMembers.map((member) => {
        return { ...member, mergeRequestsCount: 0 };
    });
    const groupMergeRequests = (await gitlabApi.MergeRequests.all({
        groupId,
        state: 'opened'
    })) as ExpandedMergeRequestSchema[];

    groupMergeRequests.forEach((mr) => {
        removeDuplicateObjectFromArray([...(mr.assignees ?? []), ...(mr.reviewers ?? [])], 'id').forEach((assignee) => {
            const userIndex = groupMembersWithCount.findIndex((user) => user.id === assignee.id);
            if (userIndex !== -1 && assignee.id !== mr.author.id) {
                groupMembersWithCount[userIndex].mergeRequestsCount += 1;
            }
        });
    });

    return groupMembersWithCount;
};

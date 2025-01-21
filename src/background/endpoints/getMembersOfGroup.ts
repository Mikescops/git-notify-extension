import { initGitlabApi } from '../utils/initGitlabApi';
import { removeDuplicateObjectFromArray } from '../../popup/helpers';
import { ExpandedMergeRequestSchema, MemberSchema } from '@gitbeaker/rest';
import { getConfiguration } from '../../common/storage';
import { GroupMember } from '../../common/types';

export const getMembersOfGroup = async (groupId: number): Promise<GroupMember[]> => {
    const settings = await getConfiguration(['accounts']);
    const gitlabApi = initGitlabApi({ account: settings.accounts[0] });
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

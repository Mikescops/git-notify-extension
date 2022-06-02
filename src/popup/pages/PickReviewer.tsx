import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, FormControl, Button, Box, Text } from '@primer/react';
import { PeopleIcon, SyncIcon } from '@primer/octicons-react';
import * as browser from 'webextension-polyfill';
import { GitlabTypes, GroupMember } from '../../background/types';
import { AvatarWithTooltip } from '../components/AvatarWithTooltip';

export const PickReviewer = () => {
    interface Group {
        text: string;
        id: number;
    }
    const [value, setValue] = React.useState('');
    const handleInputChange = (event: any) => {
        setValue(event.currentTarget.value);
    };
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [groups, setGroupsList] = useState<Group[]>([]);
    const [membersOfGroup, setMembersOfGroup] = useState<GroupMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<GroupMember>();

    useEffect(() => {
        browser.runtime
            .sendMessage({ type: 'getProjectsList' })
            .then((response: GitlabTypes.GroupSchema[]) => {
                const groups = response.map((project) => {
                    return { text: project.name, id: project.id };
                });
                setGroupsList(groups);
            })
            .catch((error) => console.error(error));
    }, []);

    const getMembersOfGroup = useCallback((groupIds) => {
        setLoadingMembers(true);
        const selectedGroup = groupIds[0].id;
        browser.runtime
            .sendMessage({ type: 'getMembersOfGroup', groupId: selectedGroup })
            .then((response) => {
                setMembersOfGroup(response);
                pickSomeone(response);
                setValue(groupIds[0].text);
                setLoadingMembers(false);
            })
            .catch((error) => console.error(error));
    }, []);

    const pickSomeone = (membersOfGroup: GroupMember[]) => {
        setSelectedMember(membersOfGroup[Math.floor(Math.random() * membersOfGroup.length)]);
    };

    return (
        <>
            <FormControl sx={{ margin: 3 }}>
                <FormControl.Label>Select a group</FormControl.Label>
                <Autocomplete>
                    <Box display="flex" flexWrap="nowrap">
                        <Autocomplete.Input
                            value={value}
                            onChange={handleInputChange}
                            leadingVisual={PeopleIcon}
                            loading={loadingMembers}
                            autoFocus
                        />
                        {selectedMember ? (
                            <Button
                                leadingIcon={SyncIcon}
                                variant="invisible"
                                size="medium"
                                sx={{ ml: 2 }}
                                onClick={() => pickSomeone(membersOfGroup)}
                            >
                                Repick
                            </Button>
                        ) : null}
                    </Box>
                    <Autocomplete.Menu
                        items={groups}
                        selectedItemIds={[]}
                        onSelectedChange={getMembersOfGroup}
                        loading={groups.length === 0}
                    />
                </Autocomplete>
            </FormControl>

            {selectedMember ? (
                <Box display="flex" flexWrap="nowrap" sx={{ margin: 3, alignItems: 'center' }}>
                    <AvatarWithTooltip assignee={selectedMember} direction="e" size={60} />{' '}
                    <Box sx={{ ml: 2 }}>
                        <Text sx={{ fontSize: 18, color: 'fg.default' }}>
                            <strong>{selectedMember.name}</strong> has been chosen
                        </Text>
                        <Text as="div" sx={{ color: 'fg.default' }}>
                            currently assigned to {selectedMember.mergeRequestsCount} opened PRs
                        </Text>
                    </Box>
                </Box>
            ) : null}
        </>
    );
};

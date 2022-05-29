import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, FormControl, Button, Box } from '@primer/react';
import { SyncIcon } from '@primer/octicons-react';
import * as browser from 'webextension-polyfill';
import { GitlabTypes } from '../../background/types';
import { AvatarWithTooltip } from './AvatarWithTooltip';

export const PickReviewer = () => {
    interface Group {
        text: string;
        id: number;
    }
    const [value, setValue] = React.useState('');
    const handleInputChange = (e: any) => {
        setValue(e.currentTarget.value);
    };
    const [groups, setGroupsList] = useState<Group[]>([]);
    const [membersOfGroup, setMembersOfGroup] = useState<GitlabTypes.UserSchema[]>([]);
    const [selectedMember, setSelectedMember] = useState<GitlabTypes.UserSchema>();

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
        const selectedGroup = groupIds[0].id;
        browser.runtime
            .sendMessage({ type: 'getMembersOfGroup', groupId: selectedGroup })
            .then((response) => {
                setMembersOfGroup(response);
                pickSomeone(response);
                setValue(groupIds[0].text);
            })
            .catch((error) => console.error(error));
        return selectedGroup;
    }, []);

    const pickSomeone = (membersOfGroup: GitlabTypes.UserSchema[]) => {
        setSelectedMember(membersOfGroup[Math.floor(Math.random() * membersOfGroup.length)]);
    };

    return (
        <>
            <FormControl sx={{ margin: 3 }}>
                <FormControl.Label>Select a group</FormControl.Label>
                <Autocomplete>
                    <Box display="flex" flexWrap="nowrap">
                        <Autocomplete.Input value={value} onChange={handleInputChange} />
                        {selectedMember ? (
                            <Button
                                leadingIcon={SyncIcon}
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
                <Box display="flex" flexWrap="nowrap" sx={{ margin: 3, alignItems: 'baseline' }}>
                    <AvatarWithTooltip assignee={selectedMember} direction="e" size={60} />{' '}
                    <Box sx={{ ml: 2, fontSize: 18 }}>
                        <strong>{selectedMember.name}</strong> has been chosen
                    </Box>
                </Box>
            ) : null}
        </>
    );
};

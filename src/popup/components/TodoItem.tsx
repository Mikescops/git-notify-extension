import React, { useCallback, useState } from 'react';
import * as browser from 'webextension-polyfill';
import { Avatar, Box, Button, FilterList, Label, Link, Text, Tooltip } from '@primer/react';
import { ClockIcon, CheckIcon } from '@primer/octicons-react';
import { calculateTimeElapsed } from '../helpers';
import { GitlabTypes } from '../../background/types';

interface Props {
    todo: GitlabTypes.TodoSchema;
}

const actionToText = (author: string, action: string) => {
    switch (action) {
        case 'assigned':
            return author + ' assigned you to';
        case 'mentioned':
            return author + ' mentioned you in';
        case 'build_failed':
            return 'The build failed for';
        case 'approval_required':
            return author + ' set you as an approver on';
        case 'unmergeable':
            return 'The following MR cannot be merged';
        case 'directly_addressed':
            return author + ' tagged you in';
        case 'marked':
            return 'You were marked on';
        default:
            return 'Your received a notification';
    }
};

export const TodoItem = ({ todo }: Props) => {
    const [visibility, setVisibility] = useState(true);

    const timeElapsed = calculateTimeElapsed(todo.created_at);

    const setTodoAsDone = useCallback(() => {
        browser.runtime
            .sendMessage({ type: 'setTodoAsDone', todoId: todo.id })
            .then(() => setVisibility(false))
            .catch((error) => console.error(error));
    }, [todo.id]);

    return (
        <FilterList.Item className={visibility ? 'mrItem' : 'hidden'}>
            <Box display="flex" flexWrap="nowrap">
                <Box className={'avatarsList'}>
                    <Avatar src={todo.author.avatar_url} alt={todo.author.name} square size={40} sx={{ mr: 2 }} />
                </Box>
                <Box mr={2} style={{ flex: 1 }}>
                    <Link as="a" href={todo.target_url} className={'mrTitle'} target="_blank">
                        {actionToText(todo.author.name, todo.action_name)} !{todo.target.iid}
                    </Link>
                    <div>
                        <Text className={'todoBody'} title={todo.body}>
                            &#34;{todo.body}&#34;
                        </Text>
                        <Label size="small" color="#8e8e8e" className={'mrLabel'}>
                            <ClockIcon /> &#160;{timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box>
                    <Tooltip aria-label={'Mark as done'} direction="w">
                        <Button variant="outline" size="small" mt={1} onClick={setTodoAsDone}>
                            <CheckIcon />
                        </Button>
                    </Tooltip>
                </Box>
            </Box>
        </FilterList.Item>
    );
};

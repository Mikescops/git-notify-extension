import React, { useCallback, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Avatar, ButtonOutline, Box, FilterList, Flex, Label, Link, Text, Tooltip } from '@primer/components';
import { ClockIcon, CheckIcon } from '@primer/octicons-react';
import { calculateTimeElapsed } from '../helpers';
import { Todo } from '../../background/types';

interface Props {
    todo: Todo;
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
        browser.runtime.sendMessage({ type: 'setTodoAsDone', todoId: todo.id }).then((error) => {
            if (error) {
                return console.error(error);
            }
            setVisibility(false);
        });
    }, [todo.id]);

    return (
        <FilterList.Item as="div" className={visibility ? 'mrItem' : 'hidden'}>
            <Flex flexWrap="nowrap">
                <Box className={'avatarsList'}>
                    <Avatar src={todo.author.avatar_url} alt={todo.author.name} square size={40} mr={2} />
                </Box>
                <Box mr={2} style={{ flex: 1 }}>
                    <Link as="a" href={todo.target_url} className={'mrTitle'} target="_blank">
                        {actionToText(todo.author.name, todo.action_name)} !{todo.target.iid}
                    </Link>
                    <div>
                        <Text className={'todoBody'} title={todo.body}>
                            &#34;{todo.body}&#34;
                        </Text>
                        <Label variant="medium" bg="white" color="#8e8e8e" className={'mrLabel'}>
                            <ClockIcon /> {timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box>
                    <Tooltip aria-label={'Mark as done'} direction="w">
                        <ButtonOutline variant="small" mt={1} onClick={setTodoAsDone}>
                            <CheckIcon />
                        </ButtonOutline>
                    </Tooltip>
                </Box>
            </Flex>
        </FilterList.Item>
    );
};

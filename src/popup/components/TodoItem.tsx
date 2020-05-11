import React from 'react';
import { Avatar, Button, Box, FilterList, Flex, Label, Link, Text } from '@primer/components';
import Octicon, { Clock } from '@primer/octicons-react';
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
    const timeElapsed = calculateTimeElapsed(todo.created_at);
    return (
        <FilterList.Item as="div" className={'mrItem'}>
            <Flex flexWrap="nowrap">
                <Box className={'avatarsList'}>
                    <Avatar src={todo.author.avatar_url} alt={todo.author.name} size={40} mr={2} />
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
                            <Octicon icon={Clock} /> {timeElapsed}
                        </Label>
                    </div>
                </Box>
                <Box mr={2}>
                    <Button>Done</Button>
                </Box>
            </Flex>
        </FilterList.Item>
    );
};

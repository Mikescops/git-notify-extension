import { useCallback, useState } from 'react';
import * as browser from 'webextension-polyfill';
import { Avatar, Box, Button, FilterList, Label, Link, Text, Tooltip } from '@primer/react';
import { ClockIcon, CheckIcon } from '@primer/octicons-react';
import { calculateTimeElapsed } from '../helpers';
import { GitlabTypes } from '../../background/types';
import { createNewTab } from '../utils/createNewTab';
import { ErrorFlash } from './ErrorFlash';

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
            return 'You received a notification';
    }
};

export const TodoItem = (props: Props) => {
    const { todo } = props;

    const [visibility, setVisibility] = useState<boolean>(true);
    const [error, setError] = useState<Error>();

    const timeElapsed = calculateTimeElapsed(todo.created_at);

    const setTodoAsDone = useCallback(() => {
        browser.runtime
            .sendMessage({ type: 'setTodoAsDone', todoId: todo.id })
            .then(() => {
                setError(undefined);
                setVisibility(false);
            })
            .catch((error) => setError(error));
    }, [todo.id]);

    return (
        <FilterList.Item className={visibility ? 'mrItem' : 'hidden'}>
            <Box display="flex" flexWrap="wrap">
                <Box className={'avatarsList'}>
                    <Avatar src={todo.author.avatar_url} alt={todo.author.name} square size={40} sx={{ mr: 2 }} />
                </Box>
                <Box mr={2} style={{ flex: 1 }}>
                    <Link
                        as="a"
                        href={todo.target_url}
                        onClick={(event: React.MouseEvent<HTMLElement>) => createNewTab(event, todo.target_url)}
                        className={'mrTitle'}
                    >
                        {actionToText(todo.author.name, todo.action_name)} !{todo.target.iid}
                    </Link>
                    <div>
                        <Text className={'todoBody'} title={todo.body}>
                            &#34;{todo.body}&#34;
                        </Text>
                        <Label size="small" sx={{ color: 'neutral.emphasis' }} className={'mrLabel'}>
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
                {error ? <ErrorFlash error={error} style={{ width: '100%' }} /> : <></>}
            </Box>
        </FilterList.Item>
    );
};

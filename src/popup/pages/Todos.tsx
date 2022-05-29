import React, { useCallback, useState } from 'react';
import { Button, FilterList } from '@primer/react';
import { CheckIcon } from '@primer/octicons-react';
import * as browser from 'webextension-polyfill';
import { GitlabTypes } from '../../background/types';
import { TodoItem } from '../components/TodoItem';
import { EmptyItems } from '../components/EmptyItems';

interface Props {
    todos: GitlabTypes.TodoSchema[];
}

export const Todos = (props: Props): JSX.Element => {
    const todosLength = props.todos.length;

    const [todosVisibility, setTodosVisibility] = useState(true);
    const setAllTodosAsDone = useCallback(() => {
        browser.runtime
            .sendMessage({ type: 'setTodoAsDone', todoId: null })
            .then(() => setTodosVisibility(false))
            .catch((error) => console.error(error));
    }, []);

    if (!props.todos || todosLength === 0 || !todosVisibility) {
        return <EmptyItems />;
    }

    return (
        <>
            {todosLength > 1 && todosVisibility ? (
                <div className={'subNav'}>
                    <p className={'subNavText'}>{todosLength} tasks to complete</p>
                    <Button onClick={setAllTodosAsDone} variant="default">
                        <CheckIcon /> Mark all as done
                    </Button>
                </div>
            ) : null}
            <FilterList className={'mrList'}>
                {props.todos.map((todo: GitlabTypes.TodoSchema) => (
                    <TodoItem todo={todo} key={todo.id} />
                ))}
            </FilterList>
        </>
    );
};

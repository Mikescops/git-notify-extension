import { useCallback, useState } from 'react';
import { Button, ActionList } from '@primer/react';
import { CheckIcon } from '@primer/octicons-react';
import * as browser from 'webextension-polyfill';
import { TodoItem } from '../components/TodoItem';
import { EmptyItems } from '../components/EmptyItems';
import { TodoSchema } from '@gitbeaker/rest';

interface Props {
    todos: TodoSchema[];
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
            <ActionList className={'mrList'}>
                {props.todos.map((todo: TodoSchema) => (
                    <TodoItem todo={todo} key={todo.id} />
                ))}
            </ActionList>
        </>
    );
};

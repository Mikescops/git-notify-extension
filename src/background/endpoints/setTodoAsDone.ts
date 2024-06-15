import * as browser from 'webextension-polyfill';
import { getSettings } from '../utils/getSettings';
import { initGitlabApi } from '../utils/initGitlabApi';
import { TodoSchema } from '@gitbeaker/rest';

export const setTodoAsDone = async (id: number | undefined): Promise<void> => {
    if (!id) {
        return;
    }

    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);

    await gitlabApi.TodoLists.done({ todoId: id });

    const storage = await browser.storage.local.get(['todos']);

    const currentTodos: TodoSchema[] = storage.todos;

    const newTodos = id ? currentTodos.filter((todo) => todo.id !== id) : [];

    return await browser.storage.local.set({ todos: newTodos });
};

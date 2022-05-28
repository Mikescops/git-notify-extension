import { getSettings } from '../utils/getSettings';
import { GitlabTypes } from '../types';
import { browser } from 'webextension-polyfill-ts';
import { initGitlabApi } from '../utils/initGitlabApi';

export const setTodoAsDone = async (id: number | undefined): Promise<void> => {
    const settings = await getSettings();
    const gitlabApi = initGitlabApi(settings);

    await gitlabApi.Todos.done({ todoId: id });

    const storage = await browser.storage.local.get(['todos']);

    const currentTodos: GitlabTypes.TodoSchema[] = storage.todos;

    const newTodos = id ? currentTodos.filter((todo) => todo.id !== id) : [];

    return await browser.storage.local.set({ todos: newTodos });
};

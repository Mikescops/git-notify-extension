import { getSettings } from '../utils/getSettings';
import { initGitlabApi } from '../utils/initGitlabApi';
import { TodoSchema } from '@gitbeaker/rest';
import { Storage } from '../../common/storage';

export const setTodoAsDone = async (id: number | undefined): Promise<void> => {
    if (!id) {
        return;
    }

    const settings = await getSettings();
    const gitlabApi = initGitlabApi({ account: settings.accounts[0] });

    await gitlabApi.TodoLists.done({ todoId: id });

    const storage = new Storage();

    const currentTodos: TodoSchema[] = (await storage.getKeys(['todos'])).todos;

    const newTodos = id ? currentTodos.filter((todo) => todo.id !== id) : [];

    await storage.setKeys({ todos: newTodos });

    return;
};

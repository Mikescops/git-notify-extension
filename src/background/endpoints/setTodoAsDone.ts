import { initGitlabApi } from '../utils/initGitlabApi';
import { getAccountData, getConfiguration, getOrCreateAccountStorage } from '../../common/storage';

export const setTodoAsDone = async (accountUuid: string, id: number | undefined): Promise<void> => {
    if (!id) {
        return;
    }

    const settings = await getConfiguration(['accounts']);
    const account = settings.accounts.find((account) => account.uuid === accountUuid);

    if (!account) {
        throw new Error('Account not found');
    }

    const gitlabApi = initGitlabApi({ account });

    await gitlabApi.TodoLists.done({ todoId: id });

    const currentTodos = (await getAccountData(account.uuid)).todos;

    if (currentTodos instanceof Error) {
        return;
    }

    const newTodos = id ? currentTodos.filter((todo) => todo.id !== id) : [];

    await (await getOrCreateAccountStorage(account.uuid)).setItem('todos', newTodos);

    return;
};

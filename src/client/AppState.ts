import { todoState } from "./Todo/TodoState2";
// import { Todos } from "./Todo/TodosView";

export const appState = () => {
  const { TodosContainer } = todoState();

  // const TodosContainer = Todos;

  return { TodosContainer };
};

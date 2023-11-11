import { todoState } from "./Todo/TodoState2";
// import { Todos } from "./Todo/TodosView";

export const appState = () => {
  const { Todos } = todoState();

  return { Todos };
};

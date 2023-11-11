import {
  completedCount,
  incompleteLeft,
  Todo,
  TodoAction,
} from "../../shared/Todo/Todo";
import { TodoInput } from "./TodoInputView";
import { TodoItem } from "./TodoItemView";

// const SecondaryButton = ({
//   onClick,
//   children,
// }: {
//   onClick: () => void;
//   children: React.ReactNode;
// }) => {
//   return (
//     <button
//       type="button"
//       className="p-2 hover:border border-gray-200 active:border-blue-300 rounded"
//       onClick={onClick}
//     >
//       {children}
//     </button>
//   );
// };

type TodosActions = {
  add: (input: string) => void;
  edit: TodoAction;
  remove: TodoAction;
  toggleComplete: TodoAction;
  removeCompleted: (todos: Todo[]) => void;
};

export const TodosView =
  ({ add, edit, remove, toggleComplete, removeCompleted }: TodosActions) =>
  ({ todos }: { todos: Todo[] }) => {
    const clearCompletedButton = (
      <button
        className="flex flex-shrink-0 hover:underline"
        onClick={() => removeCompleted(todos)}
      >
        Clear completed
      </button>
    );

    const clearCompleted =
      completedCount(todos) > 0 ? clearCompletedButton : null;

    // const filters = (
    //   <ul className="flex justify-center flex-grow">
    //     <li>
    //       <SecondaryButton onClick={() => {}}>All</SecondaryButton>
    //     </li>
    //     <li>
    //       <SecondaryButton onClick={() => {}}>Active</SecondaryButton>
    //     </li>
    //     <li>
    //       <SecondaryButton onClick={() => {}}>Completed</SecondaryButton>
    //     </li>
    //   </ul>
    // );

    return (
      <section className="text-gray-600 max-w-27 w-full">
        <h1 className="text-5xl text-center my-6">todos</h1>
        <section className="bg-white shadow">
          <header className="border-b border-gray-200">
            <TodoInput submit={add} />
          </header>
          <ul>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                edit={edit}
                remove={remove}
                toggleComplete={toggleComplete}
              />
            ))}
          </ul>
          <footer className="text-xs py-2 px-4 flex items-center justify-between">
            <span className="flex flex-shrink-0">{incompleteLeft(todos)}</span>
            {clearCompleted}
          </footer>
        </section>
        <p className="text-xs text-gray-400 text-center p-2">
          There's alternative state management solutions (Hooks, Streams)
        </p>
      </section>
    );
  };

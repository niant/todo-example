import { useState } from "react";
import { Todo, TodoAction } from "../../shared/Todo/Todo";
import { TodoInput } from "./TodoInputView";

type TodoItemProps = {
  todo: Todo;
  edit: TodoAction;
  remove: TodoAction;
  toggleComplete: TodoAction;
};

const useTodoItemState = (edit: TodoAction, todo: Todo) => {
  const [editMode, setEditMode] = useState(false);

  const onEdit = (text: string) => {
    edit({ ...todo, text });
    setEditMode(false);
  };

  const toggleEditMode = () => setEditMode(!editMode);

  return { editMode, onEdit, toggleEditMode };
};

export const TodoItem = ({
  todo,
  edit,
  remove,
  toggleComplete,
}: TodoItemProps) => {
  const { editMode, onEdit, toggleEditMode } = useTodoItemState(edit, todo);

  const editInput = (
    <TodoInput input={todo.text} submit={onEdit} onBlur={toggleEditMode} />
  );

  const deleteButton = (
    <button
      type="button"
      aria-label="Delete"
      onClick={() => remove(todo)}
      className="flex-shrink-0 p-2 pr-4 m-1 hidden li_hover-inline-block text-red-400 text-2xl"
    >
      ×
    </button>
  );

  const toggleCompleteButton = (
    <input
      type="checkbox"
      className="flex-shrink-0 appearance-none checkbox checkmark_checked m-1"
      style={{ width: "2.5em", height: "2.5em" }}
      checked={todo.completed}
      onChange={() => toggleComplete(todo)}
    />
  );

  const listItem = (
    <div className="flex items-center">
      {toggleCompleteButton}
      <span
        role="button"
        aria-label="Edit"
        onDoubleClick={toggleEditMode}
        className={
          todo.completed
            ? "line-through text-gray-400 m-2 flex-grow"
            : "m-2 flex-grow"
        }
      >
        {todo.text}
      </span>
      {deleteButton}
    </div>
  );

  const view = editMode ? editInput : listItem;

  return <li className="border-b border-gray-200">{view}</li>;
};

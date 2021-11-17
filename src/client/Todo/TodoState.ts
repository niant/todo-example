import { pipe } from "fp-ts/function";
import { either } from "fp-ts";
import { useEffect, useState } from "react";
import {
  completedIds,
  create_X,
  deleteTodo,
  deleteTodos,
  getTodos,
  postTodo,
  removeTodo,
  removeTodos,
  replaceTodo,
  Todo,
  updateTodo,
} from "../../shared/Todo/Todo";
import { logger } from "../../shared/Logger/Logger";
import * as R from "ramda";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const fetchTodos_X = async () =>
    pipe(await getTodos(), either.fold(logger.error, setTodos));

  useEffect(() => {
    fetchTodos_X();
  }, []);

  const add = async (input: string) => {
    const todo = create_X(input);
    pipe(
      await postTodo(todo)(),
      either.fold(logger.error, () => {
        setTodos(R.append(todo, todos));
      })
    );
  };

  const edit = async (todo: Todo) => {
    pipe(
      await updateTodo(todo.id, todo)(),
      either.fold(logger.error, (todo) => {
        setTodos(replaceTodo(todo)(todos));
      })
    );
  };

  const remove = async (todo: Todo) => {
    pipe(
      await deleteTodo(todo.id)(),
      either.fold(logger.error, () => setTodos(removeTodo(todo)(todos)))
    );
  };

  const toggleComplete = async (todo: Todo) => {
    pipe(
      await updateTodo(todo.id, { completed: !todo.completed })(),
      either.fold(logger.error, (todo) => {
        setTodos(replaceTodo(todo)(todos));
      })
    );
  };

  const removeCompleted = async (todos: Todo[]) => {
    const ids = completedIds(todos);
    pipe(
      await deleteTodos(ids)(),
      either.fold(logger.error, (removedTodos) => {
        setTodos(removeTodos(removedTodos)(todos));
      })
    );
  };

  return { todos, add, edit, remove, toggleComplete, removeCompleted };
};

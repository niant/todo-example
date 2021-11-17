import { pipe, flow } from "fp-ts/function";
import { size, filter, map } from "fp-ts/lib/Array";
import { nanoid } from "nanoid";
import { getV, postV, putV, removeV } from "../Http/Http";
import * as T from "io-ts";
import * as R from "ramda";
import { updateWith } from "../Util/Array";
import { partial } from "io-ts";

const todoProps = {
  id: T.string,
  text: T.string,
  completed: T.boolean,
};

export const todoCodec = T.type(todoProps);

export const todoPartialCodec = partial(todoProps);

export const todosCodec = T.array(todoCodec);

export type Todo = T.TypeOf<typeof todoCodec>;

export type TodoAction = (todo: Todo) => void;
/**
 * @notice Side-effects in this function
 */
export const create_X = (text: string): Todo => ({
  id: nanoid(),
  text,
  completed: false,
});

export const replaceTodo = (todo: Todo) => (todos: Todo[]) =>
  updateWith(R.propEq("id", todo.id), todos, todo);

export const removeTodos = (removeTodos: Todo[]) => (todos: Todo[]) =>
  R.difference(todos, removeTodos);

export const removeTodo = (todo: Todo) => (todos: Todo[]) =>
  R.reject(R.equals(todo), todos);

const isCompleted = (todo: Todo) => todo.completed;

const isIncomplete = R.complement(isCompleted);

export const incompletedCount = flow(filter(isIncomplete), size);

export const filterCompleted = filter(isCompleted);

export const completedIds = flow(filterCompleted, R.pluck("id"));

export const completedCount = flow(filterCompleted, size);

export const incompleteLeft = (todos: Todo[]) => {
  const incompleteCount = incompletedCount(todos);
  return `${incompleteCount} ${incompleteCount === 1 ? "item" : "items"} left`;
};

export const postTodo = (todo: Todo) => postV(todoCodec, "/api/todos", todo);

export const getTodos = getV(todosCodec, "/api/todos");

export const deleteTodo = (id: string) =>
  removeV(todoCodec, `/api/todos/${id}`);

export const deleteTodos = (ids: string[]) => {
  const queryString = pipe(
    ids,
    map((id) => `id=${id}`),
    R.join("&")
  );
  return removeV(todosCodec, `/api/todos/?${queryString}`);
};

export const updateTodo = (id: string, todo: Partial<Todo>) =>
  putV(todoCodec, `/api/todos/${id}`, todo);

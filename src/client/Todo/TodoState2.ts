import { append } from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import * as R from "ramda";
import { map, merge, mergeMap, scan, tap } from "rxjs";
import { logger } from "../../shared/Logger/Logger";
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
import { run } from "../../shared/Util/functions";
import {
  createReactiveAdapter,
  fromTaskEither,
} from "../../shared/Util/Stream";
import { connectView } from "../../shared/Util/View";
import { TodosView } from "./TodosView2";

export const todoState = () => {
  const fetch$ = pipe(fromTaskEither(getTodos), map(R.always));

  const [addTodo$, add] = addTodoState();
  const [edit$, edit] = editState();
  const [remove$, remove] = removeState();
  const [toggleComplete$, toggleComplete] = toggleCompleteState();
  const [rejectCompleted$, removeCompleted] = removeCompletedState();

  const todos$ = pipe(
    merge(fetch$, addTodo$, edit$, remove$, toggleComplete$, rejectCompleted$),
    scan(run, [] as Todo[]),
    tap({ error: logger.error })
  );

  const todosView$ = pipe(
    todos$,
    map((todos) => ({ todos }))
  );

  const Todos = connectView(
    TodosView({ add, edit, remove, toggleComplete, removeCompleted }),
    () => todosView$
  );

  return { Todos };
};

const addTodoState = () => {
  const [addTodoInput$, add_X] = createReactiveAdapter<string>();

  const addTodo$ = pipe(
    addTodoInput$,
    map(create_X),
    mergeMap(flow(postTodo, fromTaskEither)),
    map(append)
  );

  return [addTodo$, add_X] as const;
};

const removeState = () => {
  const [remove$, remove_X] = createReactiveAdapter<Todo>();

  const removeTodo$ = pipe(
    remove$,
    mergeMap((todo) => fromTaskEither(deleteTodo(todo.id))),
    map(removeTodo)
  );

  return [removeTodo$, remove_X] as const;
};

const editState = () => {
  const [edit$, edit_X] = createReactiveAdapter<Todo>();

  const editAction$ = pipe(
    edit$,
    mergeMap((todo) => fromTaskEither(updateTodo(todo.id, todo))),
    map(replaceTodo)
  );

  return [editAction$, edit_X] as const;
};

const toggleCompleteState = () => {
  const [toggleComplete$, toggleComplete_X] = createReactiveAdapter<Todo>();

  const toggle$ = pipe(
    toggleComplete$,
    mergeMap((todo) =>
      fromTaskEither(updateTodo(todo.id, { completed: !todo.completed }))
    ),
    map(replaceTodo)
  );

  return [toggle$, toggleComplete_X] as const;
};

const removeCompletedState = () => {
  const [removeCompleted$, removeCompleted_X] = createReactiveAdapter<Todo[]>();

  const rejectCompleted$ = pipe(
    removeCompleted$,
    map(completedIds),
    mergeMap(flow(deleteTodos, fromTaskEither)),
    map(removeTodos)
  );

  return [rejectCompleted$, removeCompleted_X] as const;
};

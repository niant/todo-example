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
import { fromTaskEither, subject } from "../../shared/Util/Stream";
import { scan, tap, map, mergeMap, merge } from "rxjs";
import { connectStreamToComponent } from "../../shared/Util/View";
import { Todos } from "./TodosView2";
import { run } from "../../shared/Util/functions";
import { append } from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";

const addTodo = () => {
  const [addTodoInput$, add_X] = subject<string>();

  const addTodo$ = pipe(
    addTodoInput$,
    map(create_X),
    mergeMap(flow(postTodo, fromTaskEither)),
    map(append)
  );

  return [addTodo$, add_X] as const;
};

const remove = () => {
  const [remove$, remove_X] = subject<Todo>();

  const removeTodo$ = pipe(
    remove$,
    mergeMap((todo) => fromTaskEither(deleteTodo(todo.id))),
    map(removeTodo)
  );

  return [removeTodo$, remove_X] as const;
};

const edit = () => {
  const [edit$, edit_X] = subject<Todo>();

  const editAction$ = pipe(
    edit$,
    mergeMap((todo) => fromTaskEither(updateTodo(todo.id, todo))),
    map(replaceTodo)
  );

  return [editAction$, edit_X] as const;
};

const toggleComplete = () => {
  const [toggleComplete$, toggleComplete_X] = subject<Todo>();

  const toggle$ = pipe(
    toggleComplete$,
    mergeMap((todo) =>
      fromTaskEither(updateTodo(todo.id, { completed: !todo.completed }))
    ),
    map(replaceTodo)
  );

  return [toggle$, toggleComplete_X] as const;
};

const removeCompleted = () => {
  const [removeCompleted$, removeCompleted_X] = subject<Todo[]>();

  const rejectCompleted$ = pipe(
    removeCompleted$,
    map(completedIds),
    mergeMap(flow(deleteTodos, fromTaskEither)),
    map(removeTodos)
  );

  return [rejectCompleted$, removeCompleted_X] as const;
};

export const todoState = () => {
  const fetch$ = pipe(fromTaskEither(getTodos), map(R.always));

  const [addTodo$, add_X] = addTodo();
  const [edit$, edit_X] = edit();
  const [remove$, remove_X] = remove();
  const [toggleComplete$, toggleComplete_X] = toggleComplete();
  const [rejectCompleted$, removeCompleted_X] = removeCompleted();

  const todos$ = pipe(
    merge(fetch$, addTodo$, edit$, remove$, toggleComplete$, rejectCompleted$),
    scan(run, [] as Todo[]),
    tap({ error: logger.error })
  );

  const todosView$ = map((todos) => ({ todos }))(todos$);

  const TodosContainer = connectStreamToComponent(
    Todos({ add_X, edit_X, remove_X, toggleComplete_X, removeCompleted_X }),
    todosView$
  );

  return { TodosContainer };
};

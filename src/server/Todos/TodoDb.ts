import { pipe } from "fp-ts/function";
import { taskEither } from "fp-ts";
import { Db, updateSql } from "../Util/Db";
import { mapWithIndex } from "fp-ts/lib/Array";
import * as R from "ramda";
import { Todo } from "../../shared/Todo/Todo";

export const fetchTodos = (db: Db) =>
  pipe(
    db.query<Todo[]>("SELECT * FROM todos"),
    taskEither.map((result) => result.rows)
  );

export const insertTodo = (db: Db) => (todo: Todo) =>
  pipe(
    db.query<Todo>(
      "INSERT INTO todos (id, text, completed) VALUES ($1, $2, $3) RETURNING *",
      [todo.id, todo.text, todo.completed]
    ),
    taskEither.map((result) => result.rows[0])
  );

export const deleteTodo = (db: Db, id: string) =>
  pipe(
    db.query<Todo>("DELETE FROM todos WHERE id = $1 RETURNING *", [id]),
    taskEither.map((result) => result.rows[0])
  );

export const deleteTodos = (db: Db) => (ids: string[]) => {
  const idsSql = pipe(
    ids,
    mapWithIndex((i, _) => `$${i + 1}`),
    R.join(",")
  );

  return pipe(
    db.query<Todo>(
      `DELETE FROM todos WHERE id IN (${idsSql}) RETURNING *`,
      ids
    ),
    taskEither.map((result) => result.rows)
  );
};

export const updateTodo = (db: Db, id: string, todo: Partial<Todo>) => {
  const { sql, values } = updateSql("todos", todo, { id });

  return pipe(
    db.query<Todo>(sql, values),
    taskEither.map((result) => result.rows[0])
  );
};

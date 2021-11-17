import express from "express";
import { pipe } from "fp-ts/function";
import { dbInstance } from "../Util/Db";
import {
  deleteTodo,
  deleteTodos,
  fetchTodos,
  insertTodo,
  updateTodo,
} from "./TodoDb";
import { either, taskEither } from "fp-ts";
import { todoCodec, todoPartialCodec } from "../../shared/Todo/Todo";
import { logger } from "../../shared/Logger/Logger";

const router = express.Router();

const db = dbInstance();

router.get("/todos", async (req, res) => {
  pipe(
    await fetchTodos(db)(),
    either.fold(
      () => res.status(500).send("Failed to fetch todos"),
      (todos) => res.status(200).json(todos)
    )
  );
});

router.post("/todos", async (req, res) => {
  const todosTaskEither = pipe(
    todoCodec.decode(req.body),
    taskEither.fromEither,
    taskEither.chainW(insertTodo(db))
  );

  pipe(
    await todosTaskEither(),
    either.fold(
      () => res.status(500).send("Failed to insert a todo"),
      (todo) => res.status(201).json(todo)
    )
  );
});

router.delete("/todos/:id", async (req, res) => {
  pipe(
    await deleteTodo(db, req.params.id)(),
    either.fold(
      () => res.status(500).send("Could not delete the required todo"),
      (todo) => res.status(200).json(todo)
    )
  );
});

router.delete("/todos", async (req, res) => {
  const ids = req.query.id as string[];
  const task = pipe(
    ids,
    taskEither.fromPredicate(
      (ids) => Array.isArray(ids) && ids.length > 0,
      () => new Error("Not valid ids")
    ),
    taskEither.chainW(deleteTodos(db))
  );

  pipe(
    await task(),
    either.fold(
      (e) => {
        logger.error(e);
        res.status(500).send("Could not delete the required todos");
      },
      (todos) => res.status(200).json(todos)
    )
  );
});

router.put("/todos/:id", async (req, res) => {
  const task = pipe(
    todoPartialCodec.decode(req.body),
    taskEither.fromEither,
    taskEither.chainW((partialTodo) =>
      updateTodo(db, req.params.id, partialTodo)
    )
  );

  pipe(
    await task(),
    either.fold(
      () => res.status(500).send("Could not update the required todo"),
      (todo) => res.status(200).json(todo)
    )
  );
});

export { router };

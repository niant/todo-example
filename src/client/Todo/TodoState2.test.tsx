import * as R from "ramda";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { todoState } from "./TodoState2";
import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import { todosGenerator } from "../../shared/Todo/TodoGenerator";
import { Todo } from "../../shared/Todo/Todo";

const post = rest.post("/api/todos", (req, res, ctx) => {
  return res(ctx.json(req.body));
});

const get = (data: unknown) =>
  rest.get("/api/todos", (req, res, ctx) => {
    return res(ctx.json(data));
  });

const put = (todo: Todo) =>
  rest.put<Partial<Todo>>("/api/todos/:id", (req, res, ctx) => {
    return res(ctx.json(R.mergeRight(todo, req.body)));
  });

test("fetch and render todos from the server", async () => {
  const server = setupServer(get(todosGenerator(1, [{ text: "Foobar" }])));
  server.listen();
  const { TodosContainer } = todoState();
  render(<TodosContainer />);

  const todoItems = await screen.findAllByRole("listitem");
  expect(todoItems).toHaveLength(1);

  todoItems.forEach((item) => {
    const text = within(item).getByText(/Foobar/i);
    const checkbox = within(item).getByRole("checkbox") as HTMLInputElement;
    expect(text).toBeInTheDocument();
    expect(checkbox.checked).toEqual(false);
  });

  server.close();
});

test("add a todo", async () => {
  const server = setupServer(
    get(todosGenerator(1, [{ text: "Foobar" }])),
    post
  );
  server.listen();
  const { TodosContainer } = todoState();
  render(<TodosContainer />);

  const todoInput = await screen.findByRole("textbox");
  userEvent.type(todoInput, "Testing{enter}");

  await waitFor(async () => {
    const todoItems = await screen.findAllByRole("listitem");
    expect(todoItems).toHaveLength(2);

    const newItem = todoItems[1];

    const text = within(newItem).getByText(/Testing/i);
    const checkbox = within(newItem).getByRole("checkbox") as HTMLInputElement;

    expect(text).toBeInTheDocument();
    expect(checkbox.checked).toEqual(false);
  });

  server.close();
});

test("remove a todo", async () => {
  const todos = todosGenerator(1, [{ text: "Foobar" }]);
  const server = setupServer(
    get(todos),
    rest.delete("/api/todos/:id", (req, res, ctx) => {
      return res(ctx.json(todos[0]));
    })
  );
  server.listen();
  const { TodosContainer } = todoState();
  render(<TodosContainer />);

  const todoItem = await screen.findByRole("listitem");
  const deleteButton = within(todoItem).getByLabelText(
    "Delete"
  ) as HTMLInputElement;

  userEvent.click(deleteButton);

  await waitForElementToBeRemoved(() => screen.queryByRole("listitem"));

  server.close();
});

test("complete a todo item", async () => {
  const todos = todosGenerator(1, [{ text: "Foobar" }]);
  const server = setupServer(get(todos), put(todos[0]));
  server.listen();
  const { TodosContainer } = todoState();
  render(<TodosContainer />);

  const todoItem = await screen.findByRole("listitem");
  const checkbox = within(todoItem).getByRole("checkbox") as HTMLInputElement;
  userEvent.click(checkbox);

  await waitFor(() => {
    expect(checkbox.checked).toEqual(true);
  });

  server.close();
});

test("edit a todo", async () => {
  const todos = todosGenerator(1, [{ text: "Foobar" }]);
  const server = setupServer(get(todos), put(todos[0]));
  server.listen();

  const { TodosContainer } = todoState();
  render(<TodosContainer />);

  const todoItem = await screen.findByRole("listitem");
  const editItem = within(todoItem).getByLabelText("Edit");
  userEvent.dblClick(editItem);

  const todoEditInput = within(todoItem).getByRole("textbox");
  userEvent.type(todoEditInput, "Edit{enter}");

  await waitFor(async () => {
    const text = within(todoItem).getByText(/FoobarEdit/i);
    expect(text).toBeInTheDocument();
  });

  server.close();
});

test("remove completed", async () => {
  const todos = todosGenerator(3, [
    { completed: true },
    { completed: true },
    { completed: false },
  ]);

  const server = setupServer(
    get(todos),
    rest.delete("/api/todos", (req, res, ctx) => {
      const ids = req.url.searchParams.getAll("id");
      const deleted = R.filter((todo) => R.includes(todo.id, ids), todos);
      return res(ctx.json(deleted));
    })
  );

  server.listen();
  const { TodosContainer } = todoState();
  render(<TodosContainer />);

  const todoItems = await screen.findAllByRole("listitem");
  expect(todoItems).toHaveLength(3);

  const clearCompleted = await screen.findByText("Clear completed");
  userEvent.click(clearCompleted);

  await waitFor(async () => {
    const todoItems = await screen.findAllByRole("listitem");
    expect(todoItems).toHaveLength(1);
  });

  server.close();
});

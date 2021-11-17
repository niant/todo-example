import * as R from "ramda";
import { nanoid } from "nanoid";
import { Todo } from "./Todo";

export const todoGenerator = (todoOverwrite: Partial<Todo> = {}): Todo => {
  return R.mergeRight(
    { id: nanoid(), text: "Test", completed: false },
    todoOverwrite
  );
};

export const todosGenerator = (
  count: number,
  todoOverwrites: Partial<Todo>[] = []
): Todo[] => {
  return R.times((i) => {
    if (todoOverwrites[i]) {
      return todoGenerator(todoOverwrites[i]);
    }
    return todoGenerator();
  }, count);
};

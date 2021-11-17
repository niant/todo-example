import { render, screen } from "@testing-library/react";
import { Todos } from "./TodosView";

test("renders learn react link", () => {
  render(<Todos />);
  const linkElement = screen.getByText(/todos/i);
  expect(linkElement).toBeInTheDocument();
});

test("boolean happiness", () => {
  expect(true).toBe(true);
});

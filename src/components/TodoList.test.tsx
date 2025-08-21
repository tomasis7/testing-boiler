import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Todo } from "../App";
import TodoList from "./TodoList";

const mockOnToggle = vi.fn();
const mockOnDelete = vi.fn();

const mockTodos: Todo[] = [
  {
    id: "1",
    text: "First todo",
    completed: false,
    createdAt: 1234567890,
  },
  {
    id: "2",
    text: "Second todo",
    completed: true,
    createdAt: 1234567891,
  },
];

describe("TodoList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state when no todos", () => {
    render(<TodoList todos={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
  });

  it("should render all todos when provided", () => {
    render(
      <TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByText("First todo")).toBeInTheDocument();
    expect(screen.getByText("Second todo")).toBeInTheDocument();
  });

  it("should render TodoItem components for each todo", () => {
    render(
      <TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByLabelText("Toggle todo: First todo")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle todo: Second todo")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete todo: First todo")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete todo: Second todo")).toBeInTheDocument();
  });

  it("should pass correct props to TodoItem components", () => {
    render(
      <TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const firstCheckbox = screen.getByLabelText("Toggle todo: First todo");
    const secondCheckbox = screen.getByLabelText("Toggle todo: Second todo");

    expect(firstCheckbox).not.toBeChecked();
    expect(secondCheckbox).toBeChecked();
  });

  it("should render with single todo", () => {
    const singleTodo = [mockTodos[0]];
    render(
      <TodoList todos={singleTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByText("First todo")).toBeInTheDocument();
    expect(screen.queryByText("No todos yet. Add one above!")).not.toBeInTheDocument();
  });
});
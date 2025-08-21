import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Todo } from "../App";
import TodoItem from "./TodoItem";

const mockOnToggle = vi.fn();
const mockOnDelete = vi.fn();

const mockTodoIncomplete: Todo = {
  id: "1",
  text: "Test todo",
  completed: false,
  createdAt: 1234567890,
};

const mockTodoCompleted: Todo = {
  id: "2",
  text: "Completed todo",
  completed: true,
  createdAt: 1234567891,
};

describe("TodoItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render incomplete todo correctly", () => {
      render(
        <TodoItem todo={mockTodoIncomplete} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      expect(screen.getByText("Test todo")).toBeInTheDocument();
      const checkbox = screen.getByLabelText("Toggle todo: Test todo");
      expect(checkbox).not.toBeChecked();
      expect(screen.getByLabelText("Delete todo: Test todo")).toBeInTheDocument();
    });

    it("should render completed todo correctly", () => {
      render(
        <TodoItem todo={mockTodoCompleted} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      expect(screen.getByText("Completed todo")).toBeInTheDocument();
      const checkbox = screen.getByLabelText("Toggle todo: Completed todo");
      expect(checkbox).toBeChecked();
    });

    it("should apply correct styling for incomplete todos", () => {
      render(
        <TodoItem todo={mockTodoIncomplete} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const todoText = screen.getByText("Test todo");
      expect(todoText).toHaveStyle({ textDecoration: "none", color: "#333" });
    });

    it("should apply correct styling for completed todos", () => {
      render(
        <TodoItem todo={mockTodoCompleted} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const todoText = screen.getByText("Completed todo");
      expect(todoText).toHaveStyle({ textDecoration: "line-through", color: "#666" });
    });
  });

  describe("interactions", () => {
    it("should call onToggle with correct id when checkbox is clicked", () => {
      render(
        <TodoItem todo={mockTodoIncomplete} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const checkbox = screen.getByLabelText("Toggle todo: Test todo");
      fireEvent.click(checkbox);

      expect(mockOnToggle).toHaveBeenCalledWith("1");
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete with correct id when delete button is clicked", () => {
      render(
        <TodoItem todo={mockTodoIncomplete} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByLabelText("Delete todo: Test todo");
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith("1");
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should not interfere with other callbacks when toggle is called", () => {
      render(
        <TodoItem todo={mockTodoIncomplete} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const checkbox = screen.getByLabelText("Toggle todo: Test todo");
      fireEvent.click(checkbox);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it("should not interfere with other callbacks when delete is called", () => {
      render(
        <TodoItem todo={mockTodoIncomplete} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByLabelText("Delete todo: Test todo");
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(
        <TodoItem todo={mockTodoIncomplete} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      expect(screen.getByLabelText("Toggle todo: Test todo")).toBeInTheDocument();
      expect(screen.getByLabelText("Delete todo: Test todo")).toBeInTheDocument();
    });

    it("should have proper ARIA labels for different todo text", () => {
      const customTodo: Todo = {
        id: "3",
        text: "Custom todo text",
        completed: false,
        createdAt: 1234567892,
      };

      render(
        <TodoItem todo={customTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      expect(screen.getByLabelText("Toggle todo: Custom todo text")).toBeInTheDocument();
      expect(screen.getByLabelText("Delete todo: Custom todo text")).toBeInTheDocument();
    });
  });
});
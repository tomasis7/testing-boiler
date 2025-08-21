import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("App", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it("should render the main heading", () => {
    render(<App />);
    const heading = screen.getByText("Todo List");
    expect(heading).toBeInTheDocument();
  });

  it("should render AddTodoForm and TodoList components", () => {
    render(<App />);
    expect(screen.getByLabelText("New todo input")).toBeInTheDocument();
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
  });

  it("should load todos from localStorage on mount", () => {
    const savedTodos = JSON.stringify([
      {
        id: "1",
        text: "Test todo",
        completed: false,
        createdAt: 1234567890,
      },
    ]);
    mockLocalStorage.getItem.mockReturnValue(savedTodos);

    render(<App />);
    expect(screen.getByText("Test todo")).toBeInTheDocument();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith("todos");
  });

  it("should handle corrupted localStorage data gracefully", () => {
    mockLocalStorage.getItem.mockReturnValue("invalid json");

    render(<App />);
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("todos");
  });

  it("should handle null localStorage data", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(<App />);
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith("todos");
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
  });

  it("should add new todos when form is submitted", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    render(<App />);
    const input = screen.getByLabelText("New todo input");
    const button = screen.getByText("Add Todo");

    fireEvent.change(input, { target: { value: "New test todo" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("New test todo")).toBeInTheDocument();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "todos",
      JSON.stringify([
        {
          id: "1234567890",
          text: "New test todo",
          completed: false,
          createdAt: 1234567890,
        },
      ])
    );

    vi.restoreAllMocks();
  });

  it("should toggle todo completion status", async () => {
    const todos = [
      {
        id: "1",
        text: "Test todo",
        completed: false,
        createdAt: 1234567890,
      },
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(todos));

    render(<App />);
    const checkbox = screen.getByLabelText("Toggle todo: Test todo");

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it("should delete todos", async () => {
    const todos = [
      {
        id: "1",
        text: "Test todo",
        completed: false,
        createdAt: 1234567890,
      },
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(todos));

    render(<App />);
    const deleteButton = screen.getByLabelText("Delete todo: Test todo");

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText("Test todo")).not.toBeInTheDocument();
      expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
    });
  });
});

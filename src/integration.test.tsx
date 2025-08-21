import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

let mockLocalStorage: any;

const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

describe("Integration Tests - Component Communication", () => {
  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  describe("App → AddTodoForm → TodoList → TodoItem integration", () => {
    it("should complete full todo workflow: add → display → toggle → delete", async () => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);

      render(<App />);

      expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();

      const input = screen.getByLabelText("New todo input");
      const addButton = screen.getByText("Add Todo");

      fireEvent.change(input, { target: { value: "Integration test todo" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Integration test todo")).toBeInTheDocument();
        expect(screen.queryByText("No todos yet. Add one above!")).not.toBeInTheDocument();
      });

      const checkbox = screen.getByLabelText("Toggle todo: Integration test todo");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      const deleteButton = screen.getByLabelText("Delete todo: Integration test todo");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText("Integration test todo")).not.toBeInTheDocument();
        expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
      });

      vi.restoreAllMocks();
    });

    it("should handle multiple todos with independent state management", async () => {
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(1234567890)
        .mockReturnValueOnce(1234567891)
        .mockReturnValueOnce(1234567892);

      render(<App />);

      const input = screen.getByLabelText("New todo input");
      const addButton = screen.getByText("Add Todo");

      fireEvent.change(input, { target: { value: "First todo" } });
      fireEvent.click(addButton);

      fireEvent.change(input, { target: { value: "Second todo" } });
      fireEvent.click(addButton);

      fireEvent.change(input, { target: { value: "Third todo" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("First todo")).toBeInTheDocument();
        expect(screen.getByText("Second todo")).toBeInTheDocument();
        expect(screen.getByText("Third todo")).toBeInTheDocument();
      });

      const firstCheckbox = screen.getByLabelText("Toggle todo: First todo");
      const thirdCheckbox = screen.getByLabelText("Toggle todo: Third todo");

      fireEvent.click(firstCheckbox);
      fireEvent.click(thirdCheckbox);

      await waitFor(() => {
        expect(firstCheckbox).toBeChecked();
        expect(screen.getByLabelText("Toggle todo: Second todo")).not.toBeChecked();
        expect(thirdCheckbox).toBeChecked();
      });

      const secondDeleteButton = screen.getByLabelText("Delete todo: Second todo");
      fireEvent.click(secondDeleteButton);

      await waitFor(() => {
        expect(screen.getByText("First todo")).toBeInTheDocument();
        expect(screen.queryByText("Second todo")).not.toBeInTheDocument();
        expect(screen.getByText("Third todo")).toBeInTheDocument();
      });

      vi.restoreAllMocks();
    });
  });

  describe("Props passing and callback integration", () => {
    it("should pass todos array from App to TodoList correctly", async () => {
      const savedTodos = JSON.stringify([
        { id: "1", text: "Saved todo 1", completed: false, createdAt: 1234567890 },
        { id: "2", text: "Saved todo 2", completed: true, createdAt: 1234567891 },
      ]);
      mockLocalStorage.getItem.mockReturnValue(savedTodos);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Saved todo 1")).toBeInTheDocument();
        expect(screen.getByText("Saved todo 2")).toBeInTheDocument();
      });

      const firstCheckbox = screen.getByLabelText("Toggle todo: Saved todo 1");
      const secondCheckbox = screen.getByLabelText("Toggle todo: Saved todo 2");

      expect(firstCheckbox).not.toBeChecked();
      expect(secondCheckbox).toBeChecked();
    });

    it("should propagate onToggle callback from App through TodoList to TodoItem", async () => {
      const savedTodos = JSON.stringify([
        { id: "test-id", text: "Test todo", completed: false, createdAt: 1234567890 },
      ]);
      mockLocalStorage.getItem.mockReturnValue(savedTodos);

      render(<App />);

      const checkbox = screen.getByLabelText("Toggle todo: Test todo");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      const expectedUpdatedTodos = JSON.stringify([
        { id: "test-id", text: "Test todo", completed: true, createdAt: 1234567890 },
      ]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("todos", expectedUpdatedTodos);
    });

    it("should propagate onDelete callback from App through TodoList to TodoItem", async () => {
      const savedTodos = JSON.stringify([
        { id: "delete-test", text: "To be deleted", completed: false, createdAt: 1234567890 },
        { id: "keep-test", text: "To be kept", completed: false, createdAt: 1234567891 },
      ]);
      mockLocalStorage.getItem.mockReturnValue(savedTodos);

      render(<App />);

      expect(screen.getByText("To be deleted")).toBeInTheDocument();
      expect(screen.getByText("To be kept")).toBeInTheDocument();

      const deleteButton = screen.getByLabelText("Delete todo: To be deleted");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText("To be deleted")).not.toBeInTheDocument();
        expect(screen.getByText("To be kept")).toBeInTheDocument();
      });

      const expectedRemainingTodos = JSON.stringify([
        { id: "keep-test", text: "To be kept", completed: false, createdAt: 1234567891 },
      ]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("todos", expectedRemainingTodos);
    });

    it("should propagate onAdd callback from App to AddTodoForm", async () => {
      vi.spyOn(Date, "now").mockReturnValue(9999999999);

      render(<App />);

      const input = screen.getByLabelText("New todo input");
      const addButton = screen.getByText("Add Todo");

      fireEvent.change(input, { target: { value: "Callback test todo" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Callback test todo")).toBeInTheDocument();
      });

      const expectedTodos = JSON.stringify([
        {
          id: "9999999999",
          text: "Callback test todo",
          completed: false,
          createdAt: 9999999999,
        },
      ]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("todos", expectedTodos);

      vi.restoreAllMocks();
    });
  });

  describe("Form validation integration with state management", () => {
    it("should prevent invalid todos from being added and maintain clean state", async () => {
      render(<App />);

      const input = screen.getByLabelText("New todo input");
      const addButton = screen.getByText("Add Todo");

      fireEvent.click(addButton);

      expect(screen.getByRole("alert")).toHaveTextContent("Todo text cannot be empty");
      expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "a".repeat(101) } });
      fireEvent.click(addButton);

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Todo text must be 100 characters or less"
      );
      expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "Valid todo" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(screen.getByText("Valid todo")).toBeInTheDocument();
        expect(screen.queryByText("No todos yet. Add one above!")).not.toBeInTheDocument();
      });
    });
  });

  describe("Persistence integration", () => {
    it("should persist state changes to localStorage across all operations", async () => {
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(1111111111)
        .mockReturnValueOnce(2222222222);

      render(<App />);

      const input = screen.getByLabelText("New todo input");
      const addButton = screen.getByText("Add Todo");

      fireEvent.change(input, { target: { value: "Persistence test 1" } });
      fireEvent.click(addButton);

      fireEvent.change(input, { target: { value: "Persistence test 2" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Persistence test 1")).toBeInTheDocument();
        expect(screen.getByText("Persistence test 2")).toBeInTheDocument();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      const firstCheckbox = screen.getByLabelText("Toggle todo: Persistence test 1");
      fireEvent.click(firstCheckbox);

      await waitFor(() => {
        expect(firstCheckbox).toBeChecked();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      const deleteButton = screen.getByLabelText("Delete todo: Persistence test 2");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText("Persistence test 2")).not.toBeInTheDocument();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });
});
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddTodoForm from "./AddTodoForm";

const mockOnAdd = vi.fn();

describe("AddTodoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render input field and submit button", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      expect(screen.getByLabelText("New todo input")).toBeInTheDocument();
      expect(screen.getByText("Add Todo")).toBeInTheDocument();
    });

    it("should render input field with correct placeholder", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      expect(input).toHaveAttribute("placeholder", "Enter a new todo...");
    });

    it("should initially have empty input field", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      expect(input).toHaveValue("");
    });

    it("should not show error message initially", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("input handling", () => {
    it("should update input value when typing", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      fireEvent.change(input, { target: { value: "New todo" } });

      expect(input).toHaveValue("New todo");
    });

    it("should clear input after successful submission", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");

      fireEvent.change(input, { target: { value: "Test todo" } });
      fireEvent.click(button);

      expect(input).toHaveValue("");
    });

    it("should clear error when typing after error occurs", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");

      fireEvent.click(button);
      expect(screen.getByRole("alert")).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "Some text" } });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("should call onAdd with trimmed text when form is submitted with valid input", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");

      fireEvent.change(input, { target: { value: "  Test todo  " } });
      fireEvent.click(button);

      expect(mockOnAdd).toHaveBeenCalledWith("Test todo");
      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    it("should submit via form submission (Enter key)", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");

      fireEvent.change(input, { target: { value: "Test todo" } });
      fireEvent.submit(screen.getByRole("form")); 

      expect(mockOnAdd).toHaveBeenCalledWith("Test todo");
    });

    it("should prevent default form submission", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const form = screen.getByRole("form");
      const mockPreventDefault = vi.fn();

      const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
      submitEvent.preventDefault = mockPreventDefault;

      fireEvent.change(screen.getByLabelText("New todo input"), { 
        target: { value: "Test" } 
      });

      form.dispatchEvent(submitEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("should show error when submitting empty text", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const button = screen.getByText("Add Todo");
      fireEvent.click(button);

      expect(screen.getByRole("alert")).toHaveTextContent("Todo text cannot be empty");
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should show error when submitting only whitespace", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(button);

      expect(screen.getByRole("alert")).toHaveTextContent("Todo text cannot be empty");
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should show error when text is too long", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");
      const longText = "a".repeat(101);

      fireEvent.change(input, { target: { value: longText } });
      fireEvent.click(button);

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Todo text must be 100 characters or less"
      );
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should accept text at exactly 100 characters", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");
      const maxText = "a".repeat(100);

      fireEvent.change(input, { target: { value: maxText } });
      fireEvent.click(button);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(mockOnAdd).toHaveBeenCalledWith(maxText);
    });

    it("should clear error after successful submission", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");

      fireEvent.click(button);
      expect(screen.getByRole("alert")).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "Valid todo" } });
      fireEvent.click(button);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should apply error styling to input when error occurs", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const input = screen.getByLabelText("New todo input");
      const button = screen.getByText("Add Todo");

      expect(input).toHaveStyle({ border: "1px solid #ddd" });

      fireEvent.click(button);

      expect(input).toHaveStyle({ border: "2px solid #8b2e2eff" });
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      expect(screen.getByLabelText("New todo input")).toBeInTheDocument();
    });

    it("should have proper role for error messages", () => {
      render(<AddTodoForm onAdd={mockOnAdd} />);

      const button = screen.getByText("Add Todo");
      fireEvent.click(button);

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
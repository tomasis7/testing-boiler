import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteButton from "./DeleteButton";

describe("DeleteButton", () => {
  it("should have a red background", () => {
    render(<DeleteButton onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveStyle(
      "background-color: rgb(255, 0, 0)"
    );
  });

  it("should display the text 'Delete'", () => {
    render(<DeleteButton onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("Delete");
  });

  it("should increment the value when clicked", () => {
    const handleClick = vi.fn();
    render(<DeleteButton onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Counter from "./CounterButton";

describe("CounterButton", () => {
  it("should start with value 0", () => {
    render(<Counter />);
    expect(screen.getByRole("button")).toHaveTextContent(/0/);
  });

  it("should increment the value when clicked", () => {
    render(<Counter />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent(/1/);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent(/3/);
  });
});

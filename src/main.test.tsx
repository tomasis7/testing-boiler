import { describe, expect, it, vi } from "vitest";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}));

vi.mock("react-dom/client", () => ({
  default: {
    createRoot: mockCreateRoot,
  },
}));

vi.mock("./App", () => ({
  default: () => "App Component",
}));

Object.defineProperty(document, "getElementById", {
  value: vi.fn(() => ({ tagName: "DIV" })),
});

describe("main", () => {
  it("should render App component to root element", async () => {
    await import("./main");

    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
  });
});
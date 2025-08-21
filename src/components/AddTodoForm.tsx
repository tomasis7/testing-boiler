import { FormEvent, useState } from "react";

interface Props {
  onAdd: (text: string) => void;
}

function AddTodoForm({ onAdd }: Props) {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedText = inputText.trim();

    if (!trimmedText) {
      setError("Todo text cannot be empty");
      return;
    }

    if (trimmedText.length > 100) {
      setError("Todo text must be 100 characters or less");
      return;
    }

    onAdd(trimmedText);
    setInputText("");
    setError("");
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (error) {
      setError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }} role="form">
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter a new todo..."
          style={{
            flex: 1,
            padding: "8px",
            border: error ? "2px solid #ff4444" : "1px solid #ddd",
            borderRadius: "4px",
          }}
          aria-label="New todo input"
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#9c9c9cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Add Todo
        </button>
      </div>
      {error && (
        <div
          style={{
            color: "#ff4444",
            fontSize: "14px",
            marginTop: "4px",
          }}
          role="alert"
        >
          {error}
        </div>
      )}
    </form>
  );
}

export default AddTodoForm;

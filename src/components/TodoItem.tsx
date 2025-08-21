import { Todo } from "../App";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: Props) {
  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        marginBottom: "8px",
        backgroundColor: todo.completed ? "#f0f1f8ff" : "#fff",
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        style={{ marginRight: "12px" }}
        aria-label={`Toggle todo: ${todo.text}`}
      />
      <span
        style={{
          flex: 1,
          textDecoration: todo.completed ? "line-through" : "none",
          color: todo.completed ? "#666" : "#333",
        }}
      >
        {todo.text}
      </span>
      <button
        onClick={handleDelete}
        style={{
          backgroundColor: "#a67b7bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
        }}
        aria-label={`Delete todo: ${todo.text}`}
      >
        Delete
      </button>
    </div>
  );
}

export default TodoItem;

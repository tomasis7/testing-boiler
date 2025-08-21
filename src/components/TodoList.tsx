import { Todo } from "../App";
import TodoItem from "./TodoItem";

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoList({ todos, onToggle, onDelete }: Props) {
  if (todos.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#666",
          padding: "40px",
          fontStyle: "italic",
        }}
      >
        No todos yet. Add one above!
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TodoList;
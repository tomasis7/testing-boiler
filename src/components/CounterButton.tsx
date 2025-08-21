import { useState } from "react";

function CounterButton() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((count) => count + 1)}>
      Count is {count}
    </button>
  );
}

export default CounterButton;

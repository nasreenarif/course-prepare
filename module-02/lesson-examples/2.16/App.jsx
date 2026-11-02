import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  function addThree() {
    setCount(n => n + 1);
    setCount(n => n + 1);
    setCount(n => n + 1);
    console.log("Value from this render:", count);
  }
  return <main><h1>Queued updates</h1><p>Count: {count}</p><button type="button" onClick={addThree}>Add three</button></main>;
}

import React from "react";
import TodoListFetch from "../TodoListFetch.jsx";

// Componente Home: solo renderiza la lista de TODO
export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100 text-center">
      <TodoListFetch />
    </div>
  );
}

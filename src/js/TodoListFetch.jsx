import { useEffect, useState, useCallback } from "react";

// URL base de la API y usuario actual
const BASE_URL = "https://playground.4geeks.com/todo";
const USER = "gio-001"; 

// Componente principal de la TODO List con API
export default function TodoListFetch() {
  // Estados principales
  const [newTaskText, setNewTaskText] = useState(""); // texto del input
  const [todos, setTodos] = useState([]);             // lista de tareas
  const [isLoading, setIsLoading] = useState(true);   // para mostrar "Cargando…"
  const [isBusy, setIsBusy] = useState(false);        // cuando hay petición en curso
  const [errorMessage, setErrorMessage] = useState("");// para mostrar errores

  // Estados para edición en línea
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // 1) Asegurar usuario: si no existe, lo creo con un array vacío []
  const ensureUserExists = useCallback(async () => {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/users/${USER}`);
      if (response.ok) return true;

      if (response.status === 404) {
        const createResponse = await fetch(`${BASE_URL}/users/${USER}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([]), // la API pide un array vacío al crear el usuario
        });
        if (!createResponse.ok) throw new Error("No se pudo crear el usuario.");
        return true;
      }

      throw new Error("No se pudo verificar/crear el usuario.");
    } catch (error) {
      setErrorMessage(error.message || "Error verificando usuario.");
      return false;
    }
  }, []);

  // 2) Traer tareas del servidor (GET)
  const fetchTodosFromServer = useCallback(async () => {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/users/${USER}`);
      if (!response.ok) throw new Error("Error al obtener la lista.");
      const data = await response.json();

      // La API devuelve { id, label, is_done }
      // Lo adapto a { id, todo, is_done } para mi UI
      const mapped = Array.isArray(data?.todos)
        ? data.todos.map((todoItem) => ({
            id: todoItem.id,
            todo: todoItem.label,
            is_done: todoItem.is_done,
          }))
        : [];
      setTodos(mapped);
    } catch (error) {
      setErrorMessage(error.message || "Error cargando tareas.");
    }
  }, []);

  // 3) Al montar el componente: asegurar usuario y cargar lista
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const ok = await ensureUserExists();
      if (ok) await fetchTodosFromServer();
      setIsLoading(false);
    })();
  }, [ensureUserExists, fetchTodosFromServer]);

  // 4) Agregar tarea (POST) y luego refrescar (GET)
  const handleAddTaskSubmit = async (event) => {
    event.preventDefault();
    const label = newTaskText.trim();
    if (!label || isBusy) return;

    setIsBusy(true);
    setErrorMessage("");
    try {
      const body = { label, is_done: false };
      const response = await fetch(`${BASE_URL}/todos/${USER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("No se pudo crear la tarea.");
      setNewTaskText("");
      await fetchTodosFromServer(); // refresco la lista después de agregar
    } catch (error) {
      setErrorMessage(error.message || "Error agregando la tarea.");
    } finally {
      setIsBusy(false);
    }
  };

  // 5) Actualizar tarea (PUT): sirve para marcar hecha o editar texto
  const updateTodoOnServer = async (id, { label, is_done }) => {
    setIsBusy(true);
    setErrorMessage("");
    try {
      const body = {};
      if (typeof label === "string") body.label = label;
      if (typeof is_done === "boolean") body.is_done = is_done;

      const response = await fetch(`${BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("No se pudo actualizar la tarea.");
      await fetchTodosFromServer();
    } catch (error) {
      setErrorMessage(error.message || "Error actualizando la tarea.");
    } finally {
      setIsBusy(false);
    }
  };

  // 5.a) Cambiar estado de "hecha" (checkbox)
  const handleToggleDone = async (todoItem) => {
    await updateTodoOnServer(todoItem.id, { is_done: !todoItem.is_done });
  };

  // 5.b) Entrar a modo edición
  const handleStartEditing = (todoItem) => {
    setEditingTodoId(todoItem.id);
    setEditingText(todoItem.todo);
  };

  // 5.c) Cancelar edición
  const handleCancelEditing = () => {
    setEditingTodoId(null);
    setEditingText("");
  };

  // 5.d) Guardar edición (PUT)
  const handleSaveEditing = async (todoItem) => {
    const newLabel = editingText.trim();
    if (!newLabel) return;
    await updateTodoOnServer(todoItem.id, { label: newLabel });
    setEditingTodoId(null);
    setEditingText("");
  };

  // 6) Eliminar una tarea (DELETE) y luego refrescar (GET)
  const handleDeleteTodo = async (todoItem) => {
    if (isBusy) return;
    setIsBusy(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/todos/${todoItem.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No se pudo eliminar la tarea.");
      await fetchTodosFromServer();
    } catch (error) {
      setErrorMessage(error.message || "Error eliminando la tarea.");
    } finally {
      setIsBusy(false);
    }
  };

  // 7) Limpiar todas las tareas (DELETE usuario) y recrear usuario vacío
  const handleClearAllTodos = async () => {
    if (!todos.length || isBusy) return;
    setIsBusy(true);
    setErrorMessage("");
    try {
      const deleteUserResponse = await fetch(`${BASE_URL}/users/${USER}`, {
        method: "DELETE",
      });
      if (!deleteUserResponse.ok)
        throw new Error("No se pudo limpiar la lista en servidor.");
      setTodos([]);

      // Recreo usuario vacío para que pueda seguir usando la app
      const recreateResponse = await fetch(`${BASE_URL}/users/${USER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([]),
      });
      if (!recreateResponse.ok)
        throw new Error("Se limpió, pero no se pudo recrear el usuario.");
    } catch (error) {
      setErrorMessage(error.message || "Error limpiando todas las tareas.");
    } finally {
      setIsBusy(false);
    }
  };

  // Cálculo del contador de pendientes (UX)
  const pendingCount = todos.filter((todoItem) => !todoItem.is_done).length;

  // Render del componente
  return (
    <div className="container my-3 text-start">
      <div
        className="border bg-light p-3 rounded-3 shadow-sm"
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        <h1 className="text-dark fw-bold text-center">Todo List</h1>

        {/* Mensajes de error */}
        {errorMessage && (
          <div className="alert alert-danger py-2 mt-2">{errorMessage}</div>
        )}

        {/* Formulario de nueva tarea */}
        <form onSubmit={handleAddTaskSubmit} className="my-3">
          <div className="input-group">
            <input
              id="taskInput"
              type="text"
              className="form-control shadow-sm"
              placeholder="Escribe una tarea..."
              value={newTaskText}
              onChange={(event) => setNewTaskText(event.target.value)}
              disabled={isBusy}
            />
            <button className="btn btn-primary" disabled={isBusy}>
              Agregar
            </button>
          </div>
        </form>

        {/* Contador de pendientes (UX) */}
        <div className="mb-2 text-center">
          <small className="text-muted">
            {pendingCount} pendientes de {todos.length}
          </small>
        </div>

        {/* Botón limpiar todas */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <small className="text-muted">Usuario: <code>{USER}</code></small>
          <button
            className="btn btn-warning btn-sm"
            onClick={handleClearAllTodos}
            disabled={!todos.length || isBusy}
          >
            Limpiar todas
          </button>
        </div>

        {/* Lista de tareas */}
        {isLoading ? (
          <p className="text-muted">Cargando…</p>
        ) : (
          <ul className="list-group">
            {todos.map((todoItem) => {
              const isEditing = editingTodoId === todoItem.id;
              return (
                <li
                  key={todoItem.id}
                  className="list-group-item d-flex justify-content-between align-items-center gap-2"
                >
                  {/* Checkbox + texto o input si está editando */}
                  <div className="d-flex align-items-center gap-2 flex-grow-1">
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={!!todoItem.is_done}
                      onChange={() => handleToggleDone(todoItem)}
                      disabled={isBusy}
                      title="Marcar como hecha"
                    />

                    {isEditing ? (
                      <input
                        className="form-control"
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleSaveEditing(todoItem);
                          if (event.key === "Escape") handleCancelEditing();
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={todoItem.is_done ? "text-muted" : ""}
                        style={{
                          textDecoration: todoItem.is_done ? "line-through" : "none",
                          opacity: todoItem.is_done ? 0.7 : 1,
                        }}
                      >
                        {todoItem.todo}
                      </span>
                    )}
                  </div>

                  {/* Botones de acción (texto, sin iconos) */}
                  <div className="d-flex align-items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleSaveEditing(todoItem)}
                          disabled={isBusy || !editingText.trim()}
                          title="Guardar cambios"
                        >
                          Guardar
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEditing}
                          disabled={isBusy}
                          title="Cancelar edición"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleStartEditing(todoItem)}
                        disabled={isBusy}
                        title="Editar tarea"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteTodo(todoItem)}
                      disabled={isBusy}
                      title="Eliminar tarea"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}

            <li className="list-group-item text-center text-muted">
              {todos.length
                ? `${todos.length} tareas en total`
                : "No tienes tareas, agrega la primera ✍️"}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

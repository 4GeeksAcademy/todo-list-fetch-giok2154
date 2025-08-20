import { useEffect, useState } from "react";
export const TodoListFetch = () => {
  
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState([
    { id: 1, todo: 'Tarea 1' },
    { id: 2, todo: 'Tarea 2' },
    { id: 3, todo: 'Tarea 3' }
  ])

  const handleTask = (event) => {
    setTask(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (task.trim() != '') {
      setTodos([...todos, { id: todos.length + 1, todo: task }])
    }
    setTask('')
  }

  const handleDelete = (tarea) => {
    console.log(tarea)
    console.log(todos.filter((item) => item.id != tarea.id))
    setTodos(todos.filter((item) => item.id != tarea.id))
  }
  return (
    <div className="container my-3 text-start">
      <div className="border bg-light p-2  rounded-3 shadow-sm ">

      <div className="row">
        <div className="col-10 col-sm-8 col-md-6  m-auto">
          <h1 className="text-dark fw-bold text-center" >Todo List  <i className="fa-solid fa-list-check"></i></h1>
        </div>
      </div>
      <div className="row p-1">
        <div className="col-10 col-sm-8 col-md-6 m-auto">
          <div className="border-dark rounded bg-body-secondary p-3 shadow-sm">

            <h2 className="text-dark "> <i className="fa-solid fa-circle-plus fa-sm"></i> Add Task</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="taskInput" className="form-label">New Task </label>
                <input type="text" className="form-control shadow-sm" id="taskInput" placeholder="add new task"
                  value={task} onChange={handleTask} />
              </div>
            </form>
          </div>

        </div>
      </div>

      <hr />

      <div className="row p-3">
        <div className="col-10 col-sm-8 col-md-6 m-auto border rounded-3 p-2 shadow-sm">
          <h2 className="text"> List <i className="fa-solid fa-clipboard-list shadow fa-sm">  </i></h2>

          <ul className="list-group">

            {todos.map((item) =>
              <li key={item.id} className="list-group-item d-flex justify-content-between hidden-icon shadow">
                {item.todo}
                <span onClick={() => handleDelete(item)}>
                  <i className="fa-solid fa-trash shadow-lg"></i>
                </span>
              </li>
            )}

            <li className="list-group-item text-end">
              {todos.length ? todos.length + ' Tareas' : 'No tienes tareas'}
            </li>
          </ul>

        </div>
      </div>
      </div>

    </div>
  );
}
import React from "react";
import ReactDOM from "react-dom/client";

// Bootstrap CSS (opcional pero útil para estilos)
import "bootstrap/dist/css/bootstrap.min.css";

// Estilos globales (si tienes un index.css)
import "../styles/index.css";

// Importo Home (asegúrate de que el archivo existe en esta ruta)
import Home from "./components/Home.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);

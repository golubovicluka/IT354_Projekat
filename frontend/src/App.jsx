import { useState } from "react";
import Login from "./pages/Login.jsx"
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h1>Architext app works!</h1>
      <Login />
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ flexGrow: 1, minHeight: "400px", position: "relative" }}>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
        />
      </div>
    </div>
  )
}

export default App

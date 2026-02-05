import React from "react";
import ReactDOM from "react-dom/client";
import { AppWrapper } from "./App"; // use the wrapper
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
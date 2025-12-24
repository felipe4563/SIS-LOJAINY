import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AbilityContext } from "./context/AbilityContext";
import { ability } from "./ability/ability";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AbilityContext.Provider value={ability}>
          <App />
        </AbilityContext.Provider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

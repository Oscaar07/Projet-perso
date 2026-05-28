import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { ErrorBoundary } from "./ui/ErrorBoundary";

// React mounts the whole game shell into the single root element.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { serviceWorkerManager } from "./lib/serviceWorker";

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await serviceWorkerManager.register();
      console.log("Service Worker registered successfully");
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

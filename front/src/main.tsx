import posthog from "posthog-js";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.tsx";
import { POSTHOG_TOKEN } from "./constants.ts";

posthog.init(POSTHOG_TOKEN, {
  api_host: "https://app.posthog.com",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

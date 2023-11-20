import mixpanel from "mixpanel-browser";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { MIXPANEL_TOKEN } from "./constants.ts";

mixpanel.init(MIXPANEL_TOKEN, {
  ignore_dnt: true,
  debug: false,
  track_pageview: true,
  persistence: "localStorage",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

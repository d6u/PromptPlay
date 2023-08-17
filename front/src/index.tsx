import App from "./components/App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import "@fontsource/public-sans";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import React from "react";
import ReactDOM from "react-dom/client";

const theme = extendTheme({
  fontFamily: {
    body: '"Inter", sans-serif',
  },
  components: {
    JoyButton: {
      defaultProps: {
        color: "neutral",
        size: "md",
        variant: "soft",
        sx: {
          borderRadius: "5px",
        },
      },
    },
    JoyInput: {
      defaultProps: {
        variant: "outlined",
        size: "md",
        color: "neutral",
        sx: {
          borderRadius: "5px",
        },
      },
    },
    JoyTextarea: {
      defaultProps: {
        variant: "plain",
        color: "neutral",
      },
    },
    JoySelect: {
      defaultProps: {
        variant: "outlined",
        size: "md",
        color: "neutral",
        sx: {
          borderRadius: "5px",
        },
      },
    },
    JoyRadio: {
      defaultProps: {
        color: "neutral",
        size: "md",
        variant: "outlined",
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <App />
    </CssVarsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

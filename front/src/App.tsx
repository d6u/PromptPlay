import CssBaseline from "@mui/joy/CssBaseline";
import GlobalStyles from "@mui/joy/GlobalStyles";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { Provider as GraphQLProvider } from "urql";
import Routes from "./Routes";
import { client } from "./state/urql";

const theme = extendTheme({
  fontFamily: {
    body: '"Inter", sans-serif',
  },
  components: {
    JoyInput: {
      defaultProps: {
        size: "sm",
        variant: "outlined",
        color: "neutral",
      },
    },
    JoyTextarea: {
      defaultProps: {
        size: "sm",
        variant: "outlined",
        color: "neutral",
      },
    },
    JoySelect: {
      defaultProps: {
        size: "sm",
        variant: "outlined",
        color: "neutral",
      },
    },
    JoyRadioGroup: {
      defaultProps: {
        size: "sm",
        color: "neutral",
      },
    },
    JoyRadio: {
      defaultProps: {
        size: "sm",
        variant: "outlined",
        color: "neutral",
      },
    },
    JoyButton: {
      defaultProps: {
        size: "sm",
        variant: "solid",
        color: "neutral",
      },
    },
    JoyIconButton: {
      defaultProps: {
        size: "sm",
        variant: "plain",
        color: "neutral",
      },
    },
  },
});

export default function App() {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline disableColorScheme />
      <GlobalStyles
        styles={{
          ":root": {
            "--mono-font-family":
              'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
          },
          html: { height: "100%" },
          body: {
            height: "100%",
            backgroundColor: "#fff",
            webkitFontSmoothing: "antialiased",
            mozOsxFontSmoothing: "grayscale",
          },
          "#root": {
            height: "100%",
          },
          code: {
            fontFamily: "var(--mono-font-family)",
          },
        }}
      />
      <GraphQLProvider value={client}>
        <Routes />
      </GraphQLProvider>
    </CssVarsProvider>
  );
}

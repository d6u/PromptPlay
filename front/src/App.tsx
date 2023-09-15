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
    JoyMenuButton: {
      defaultProps: {
        size: "sm",
        variant: "solid",
        color: "neutral",
      },
    },
    JoyMenu: {
      defaultProps: {
        size: "sm",
      },
    },
    JoyMenuItem: {
      defaultProps: {
        color: "primary", // Somehow this doesn't work
      },
    },
    JoyFormControl: {
      defaultProps: {
        size: "sm",
      },
    },
    JoyTable: {
      defaultProps: {
        size: "sm",
        borderAxis: "both",
        noWrap: true,
        hoverRow: true,
        sx: {
          tableLayout: "auto",
          "--Table-headerUnderlineThickness": "1px",
          "--TableCell-headBackground": "#ebebeb",
        },
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
            "--font-family-mono":
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
            fontFamily: "var(--font-family-mono)",
          },
        }}
      />
      <GraphQLProvider value={client}>
        <Routes />
      </GraphQLProvider>
    </CssVarsProvider>
  );
}

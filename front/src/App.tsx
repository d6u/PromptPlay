import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { Provider as GraphQLProvider } from "urql";
import Routes from "./Routes";
import { client } from "./state/urql";
import "./App.css";

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
  },
});

export default function App() {
  return (
    <CssVarsProvider theme={theme}>
      <GraphQLProvider value={client}>
        <Routes />
      </GraphQLProvider>
    </CssVarsProvider>
  );
}

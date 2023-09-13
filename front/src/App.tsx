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
      <GraphQLProvider value={client}>
        <Routes />
      </GraphQLProvider>
    </CssVarsProvider>
  );
}

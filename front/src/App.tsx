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

export default function App() {
  return (
    <GraphQLProvider value={client}>
      <CssVarsProvider theme={theme}>
        <Routes />
      </CssVarsProvider>
    </GraphQLProvider>
  );
}
import { ApolloProvider } from "@apollo/client";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { useEffect, useRef, useState } from "react";
import { RecoilRoot } from "recoil";
import { ApolloClientType, createApolloClient } from "../state/graphql";
import { usePersistStore } from "../state/zustand";
import Routes from "./Routes";
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
    <CssVarsProvider theme={theme}>
      <RecoilRoot>
        <AppGraphQl />
      </RecoilRoot>
    </CssVarsProvider>
  );
}

// Split into two components to because useRecoilValue needs RecoilRoot
function AppGraphQl() {
  const placeholderUserToken = usePersistStore(
    (state) => state.placeholderUserToken
  );

  const [apolloClient, setApolloClient] = useState<ApolloClientType>(
    createApolloClient({ placeholderUserToken: placeholderUserToken })
  );

  const placeholderUserTokenRef = useRef<string | null>(placeholderUserToken);

  useEffect(() => {
    if (placeholderUserTokenRef.current === placeholderUserToken) {
      return;
    }
    placeholderUserTokenRef.current = placeholderUserToken;
    setApolloClient(
      createApolloClient({ placeholderUserToken: placeholderUserToken })
    );
  }, [placeholderUserToken]);

  return (
    <ApolloProvider client={apolloClient}>
      <Routes />
    </ApolloProvider>
  );
}

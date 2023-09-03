import { ApolloProvider } from "@apollo/client";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { useEffect, useRef, useState } from "react";
import { RecoilRoot, useRecoilValue } from "recoil";
import { RecoilSync } from "recoil-sync";
import { ApolloClientType, createApolloClient } from "../state/graphql";
import { LOCAL_USER_SETTINGS, placeholderUserTokenState } from "../state/store";
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
        <RecoilSync
          storeKey={LOCAL_USER_SETTINGS}
          read={(itemKey) => localStorage.getItem(itemKey) ?? ""}
          write={({ diff }) => {
            for (const [key, value] of diff) {
              localStorage.setItem(key, value as string);
            }
          }}
        >
          <AppGraphQl />
        </RecoilSync>
      </RecoilRoot>
    </CssVarsProvider>
  );
}

// Split into two components to because useRecoilValue needs RecoilRoot
function AppGraphQl() {
  const placeholderUserToken = useRecoilValue(placeholderUserTokenState);
  const prevPlaceholderUserTokenRef = useRef<string>(placeholderUserToken);
  const [apolloClient, setApolloClient] = useState<ApolloClientType>(
    createApolloClient({ placeholderUserToken })
  );

  useEffect(() => {
    if (prevPlaceholderUserTokenRef.current === placeholderUserToken) {
      return;
    }
    prevPlaceholderUserTokenRef.current = placeholderUserToken;
    setApolloClient(createApolloClient({ placeholderUserToken }));
  }, [placeholderUserToken]);

  return (
    <ApolloProvider client={apolloClient}>
      <Routes />
    </ApolloProvider>
  );
}

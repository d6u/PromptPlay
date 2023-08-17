import { ApolloClientType, createApolloClient } from "../state/graphql";
import { LOCAL_USER_SETTINGS, placeholderUserTokenState } from "../state/store";
import "./App.css";
import Routes from "./Routes";
import { ApolloProvider } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { RecoilRoot, useRecoilValue } from "recoil";
import { RecoilSync } from "recoil-sync";

export default function App() {
  return (
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

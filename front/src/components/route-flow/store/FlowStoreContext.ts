import { createContext, useContext } from "react";
import invariant from "ts-invariant";
import { FlowStore } from ".";

export const FlowStoreContext = createContext<{
  store?: FlowStore;
}>({});

export function useStoreFromFlowStoreContext() {
  const { store } = useContext(FlowStoreContext);
  invariant(
    store != null,
    "This component must be rendered within a <FlowStoreContextProvider />",
  );
  return store;
}

import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';
import { useStore } from 'zustand';
import { FlowStore } from '.';
import { FlowState } from './store-flow-state-types';

export const FlowStoreContext = createContext<{
  store?: FlowStore;
}>({});

export function useStoreFromFlowStoreContext() {
  const { store } = useContext(FlowStoreContext);
  invariant(
    store != null,
    'This component must be rendered within a <FlowStoreContextProvider />',
  );
  return store;
}

export function useFlowStore<T>(selector: (state: FlowState) => T) {
  const store = useStoreFromFlowStoreContext();
  return useStore(store, selector);
}

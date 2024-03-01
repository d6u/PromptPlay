import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';
import { useStore } from 'zustand';

import { FlowStore } from '../flow-store';
import { FlowState } from '../types';

export const FlowStoreContext = createContext<{
  store?: FlowStore;
}>({});

export function useFlowStore<T>(selector: (state: FlowState) => T): T {
  const { store } = useContext(FlowStoreContext);
  invariant(
    store != null,
    'This component must be rendered within a <FlowStoreContextProvider />',
  );
  return useStore(store, selector);
}

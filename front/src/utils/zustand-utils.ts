import zukeeper from "zukeeper";
import {
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
  UseBoundStore,
} from "zustand";

// See https://docs.pmnd.rs/zustand/guides/auto-generating-selectors
// for reference.

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

// SECTION: zukeeper (zustand dev tool)

type State = unknown;

type ZukeeperTS = <
  T extends State,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

type ZukeeperTSImplType = <T extends State>(
  f: StateCreator<T, [], []>,
) => StateCreator<T, [], []>;

const zukeeperTs: ZukeeperTSImplType = (...a) => {
  return zukeeper(...a);
};

export const zukeeperTsLogger = zukeeperTs as unknown as ZukeeperTS;

// !SECTION

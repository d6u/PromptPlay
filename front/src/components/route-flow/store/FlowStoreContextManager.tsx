import { useEffect, useState } from 'react';
import { FlowStore, createFlowStore } from '.';
import { FlowStoreContext } from './FlowStoreContext';

type Props = {
  spaceId: string;
  children: React.ReactNode;
};

export default function FlowStoreContextManager(props: Props) {
  const [store, setStore] = useState<FlowStore | null>(null);

  useEffect(() => {
    const localStore = createFlowStore({ spaceId: props.spaceId });
    localStore.getState().initialize();

    setStore(localStore);

    return () => {
      localStore.getState().deinitialize();
      setStore(null);
    };
  }, [props.spaceId]);

  if (store == null) {
    return null;
  }

  return (
    <FlowStoreContext.Provider value={{ store }}>
      {props.children}
    </FlowStoreContext.Provider>
  );
}

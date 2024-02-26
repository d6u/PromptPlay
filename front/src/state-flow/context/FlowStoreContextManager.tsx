import { ReactNode, useEffect, useState } from 'react';
import { FlowStoreContext } from 'state-flow/context/FlowStoreContext';
import { StateMachineAction } from 'state-flow/finite-state-machine';
import { FlowStore, createFlowStore } from 'state-flow/flow-state';

type Props = {
  spaceId: string;
  children: ReactNode;
};

export default function FlowStoreContextManager(props: Props) {
  const [store, setStore] = useState<FlowStore | null>(null);

  useEffect(() => {
    const localStore = createFlowStore({ spaceId: props.spaceId });

    localStore.getState().actorSend({ type: StateMachineAction.Initialize });

    setStore(localStore);

    return () => {
      localStore
        .getState()
        .actorSend({ type: StateMachineAction.LeaveFlowRoute });

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

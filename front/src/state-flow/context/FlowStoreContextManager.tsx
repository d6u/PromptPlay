import { ReactNode, useEffect, useState } from 'react';
import { FlowStoreContext } from 'state-flow/context/FlowStoreContext';
import { FlowStore, createFlowStore } from 'state-flow/flow-store';
import { CanvasStateMachineEventType } from 'state-flow/types';

type Props = {
  spaceId: string;
  children: ReactNode;
};

export default function FlowStoreContextManager(props: Props) {
  const [store, setStore] = useState<FlowStore | null>(null);

  useEffect(() => {
    const localStore = createFlowStore({ spaceId: props.spaceId });

    localStore.getState().canvasStateMachine.send({
      type: CanvasStateMachineEventType.Initialize,
    });

    setStore(localStore);

    return () => {
      localStore.getState().canvasStateMachine.send({
        type: CanvasStateMachineEventType.LeaveFlowRoute,
      });

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

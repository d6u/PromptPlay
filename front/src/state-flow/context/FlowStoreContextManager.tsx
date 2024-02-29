import { ReactNode, useEffect, useState } from 'react';
import { FlowStoreContext } from 'state-flow/context/FlowStoreContext';
import { FlowStore, createFlowStore } from 'state-flow/flow-state';
import { CanvasStateMachineEventType } from 'state-flow/types';

type Props = {
  spaceId: string;
  children: ReactNode;
};

export default function FlowStoreContextManager(props: Props) {
  const [store, setStore] = useState<FlowStore | null>(null);

  useEffect(() => {
    const localStore = createFlowStore({ spaceId: props.spaceId });

    console.log('state', localStore.getState());

    localStore.getState().canvasStateMachine.start();

    localStore.getState().canvasStateMachine.send({
      type: CanvasStateMachineEventType.Initialize,
    });

    setStore(localStore);

    return () => {
      localStore.getState().canvasStateMachine.send({
        type: CanvasStateMachineEventType.LeaveFlowRoute,
      });

      localStore.getState().canvasStateMachine.stop();

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

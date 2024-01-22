import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import invariant from 'tiny-invariant';
import FlowContext from './FlowContext';
import { FlowLoaderData } from './route-loader';
import { useStoreFromFlowStoreContext } from './store/FlowStoreContext';
import FlowStoreContextManager from './store/FlowStoreContextManager';
import SubHeader from './sub-header/SubHeader';

export default function RouteFlow() {
  const spaceId = useParams<{ spaceId: string }>().spaceId;
  invariant(spaceId != null);

  useEffect(() => {
    posthog.capture('Open Flow', { flowId: spaceId });
  }, [spaceId]);

  return (
    <FlowStoreContextManager spaceId={spaceId}>
      <ReactFlowProvider>
        <RouteFlowInner />
      </ReactFlowProvider>
    </FlowStoreContextManager>
  );
}

function RouteFlowInner() {
  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  const flowStore = useStoreFromFlowStoreContext();

  // const isInitialized = useStore(flowStore, (s) => s.isInitialized);
  // {isInitialized && <FlowCanvas />}

  return (
    <FlowContext.Provider value={{ isCurrentUserOwner }}>
      {isCurrentUserOwner && <SubHeader />}
      <Outlet />
    </FlowContext.Provider>
  );
}

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import invariant from 'tiny-invariant';
import FlowContext from './FlowContext';
import SubHeader from './common/SubHeader';
import { FlowLoaderData } from './route-loader';
import FlowStoreContextManager from './store/FlowStoreContextManager';

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

  return (
    <FlowContext.Provider value={{ isCurrentUserOwner }}>
      {isCurrentUserOwner && <SubHeader />}
      <Outlet />
    </FlowContext.Provider>
  );
}

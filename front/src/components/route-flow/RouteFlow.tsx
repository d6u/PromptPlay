import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import FlowContext from './common/FlowContext';
import FlowStoreContextManager from './common/FlowStoreContextManager';
import SubHeader from './common/SubHeader';
import { FlowLoaderData } from './route-loader';

export default function RouteFlow() {
  const params = useParams<{ spaceId: string }>();
  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  useEffect(() => {
    posthog.capture('Open Flow', { flowId: params.spaceId });
  }, [params.spaceId]);

  return (
    <FlowContext.Provider value={{ isCurrentUserOwner }}>
      <FlowStoreContextManager spaceId={params.spaceId!}>
        <ReactFlowProvider>
          {isCurrentUserOwner && <SubHeader />}
          <Outlet />
        </ReactFlowProvider>
      </FlowStoreContextManager>
    </FlowContext.Provider>
  );
}

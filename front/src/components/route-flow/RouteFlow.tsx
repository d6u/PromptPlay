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
    <FlowStoreContextManager spaceId={params.spaceId!}>
      <ReactFlowProvider>
        <FlowContext.Provider value={{ isCurrentUserOwner }}>
          {isCurrentUserOwner && <SubHeader />}
          <Outlet />
        </FlowContext.Provider>
      </ReactFlowProvider>
    </FlowStoreContextManager>
  );
}

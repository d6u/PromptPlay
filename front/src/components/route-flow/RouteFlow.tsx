import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import invariant from 'tiny-invariant';
import FlowStoreContextManager from './common/FlowStoreContextManager';
import RouteFlowContext from './common/RouteFlowContext';
import SubHeader from './common/SubHeader';
import { FlowLoaderData } from './route-loader-flow';

export default function RouteFlow() {
  const params = useParams<{ spaceId: string }>();
  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  useEffect(() => {
    posthog.capture('Open Flow', { flowId: params.spaceId });
  }, [params.spaceId]);

  invariant(params.spaceId != null, 'spaceId should have value');

  return (
    <RouteFlowContext.Provider
      value={{ isCurrentUserOwner, spaceId: params.spaceId }}
    >
      <FlowStoreContextManager spaceId={params.spaceId}>
        <ReactFlowProvider>
          {isCurrentUserOwner && <SubHeader />}
          <Outlet />
        </ReactFlowProvider>
      </FlowStoreContextManager>
    </RouteFlowContext.Provider>
  );
}

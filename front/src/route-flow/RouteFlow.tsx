import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import invariant from 'tiny-invariant';

import { ResizeObserverProvider } from 'generic-util/ResizeObserver';
import SubHeaderView from 'view-sub-header/SubHeaderView';
import FlowStoreContextManager from './common/FlowStoreContextManager';
import RouteFlowContext from './common/RouteFlowContext';
import { FlowLoaderData } from './route-loader-flow';

import 'reactflow/dist/style.css';

export default function RouteFlow() {
  const params = useParams<{ spaceId: string }>();
  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  useEffect(() => {
    posthog.capture('Open Flow', { flowId: params.spaceId });
  }, [params.spaceId]);

  invariant(params.spaceId != null, 'spaceId should have value');

  return (
    <ResizeObserverProvider>
      <RouteFlowContext.Provider
        value={{
          isCurrentUserOwner,
          spaceId: params.spaceId,
        }}
      >
        <FlowStoreContextManager spaceId={params.spaceId}>
          <ReactFlowProvider>
            <SubHeaderView />
            <Outlet />
          </ReactFlowProvider>
        </FlowStoreContextManager>
      </RouteFlowContext.Provider>
    </ResizeObserverProvider>
  );
}

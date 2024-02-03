import { ResizeObserverProvider } from 'generic-util/ResizeObserver';
import { FlowRouteTab } from 'generic-util/route-utils';
import posthog from 'posthog-js';
import { useEffect, useMemo } from 'react';
import { Outlet, useLoaderData, useMatches, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import invariant from 'tiny-invariant';
import SubHeaderView from 'view-sub-header/SubHeaderView';
import FlowStoreContextManager from './common/FlowStoreContextManager';
import RouteFlowContext from './common/RouteFlowContext';
import { FlowLoaderData } from './route-loader-flow';

export default function RouteFlow() {
  const params = useParams<{ spaceId: string }>();
  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;
  const matches = useMatches();

  const flowTabType = useMemo(() => {
    const data = matches[2].handle as { tabType: FlowRouteTab };
    return data.tabType;
  }, [matches]);

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
          flowTabType,
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

import { useEffect } from 'react';
import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import invariant from 'tiny-invariant';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';
import SubHeaderView from 'view-sub-header/SubHeaderView';

import { FlowLoaderData } from './flowRouteLoader';

import 'reactflow/dist/style.css';

export default function RouteFlow() {
  const { spaceId } = useParams<{ spaceId: string | undefined }>();

  invariant(spaceId != null, 'spaceId should have value');

  const enterFlowRoute = useFlowStore((s) => s.enterFlowRoute);
  const leaveFlowRoute = useFlowStore((s) => s.leaveFlowRoute);

  useEffect(() => {
    enterFlowRoute(spaceId);
    return () => leaveFlowRoute();
  });

  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  return (
    <RouteFlowContext.Provider value={{ isCurrentUserOwner, spaceId }}>
      {/* ReactFlowProvider must wrap SubHeaderView because SubHeaderView
          has usage of ReactFlow API */}
      <ReactFlowProvider>
        <SubHeaderView />
        <Outlet />
      </ReactFlowProvider>
    </RouteFlowContext.Provider>
  );
}

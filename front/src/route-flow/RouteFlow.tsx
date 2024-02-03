import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import invariant from 'tiny-invariant';

import { ResizeObserverProvider } from 'generic-util/ResizeObserver';
import SubHeaderView from 'view-sub-header/SubHeaderView';
import RouteFlowContext from '../state-flow/context/FlowRouteContext';
import FlowStoreContextManager from '../state-flow/context/FlowStoreContextManager';
import { FlowLoaderData } from './flowRouteLoader';

import 'reactflow/dist/style.css';

export default function RouteFlow() {
  const { spaceId } = useParams<{ spaceId: string | undefined }>();

  invariant(spaceId != null, 'spaceId should have value');

  const { isCurrentUserOwner } = useLoaderData() as FlowLoaderData;

  return (
    <ResizeObserverProvider>
      <RouteFlowContext.Provider value={{ isCurrentUserOwner, spaceId }}>
        <FlowStoreContextManager spaceId={spaceId}>
          {/* ReactFlowProvider must wrap SubHeaderView because SubHeaderView
              has usage of ReactFlow API */}
          <ReactFlowProvider>
            <SubHeaderView />
            <Outlet />
          </ReactFlowProvider>
        </FlowStoreContextManager>
      </RouteFlowContext.Provider>
    </ResizeObserverProvider>
  );
}

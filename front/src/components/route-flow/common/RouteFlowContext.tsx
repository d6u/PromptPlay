import { FlowRouteTab } from 'generic-util/route-utils';
import { createContext } from 'react';

const RouteFlowContext = createContext<{
  isCurrentUserOwner: boolean;
  spaceId: string;
  flowTabType: FlowRouteTab;
}>({
  isCurrentUserOwner: false,
  spaceId: '',
  flowTabType: FlowRouteTab.Canvas,
});

export default RouteFlowContext;

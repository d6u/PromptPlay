import { createContext } from 'react';
import { FlowRouteTab } from '../../../utils/route-utils';

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

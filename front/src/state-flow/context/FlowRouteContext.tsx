import { createContext } from 'react';

const RouteFlowContext = createContext<{
  isCurrentUserOwner: boolean;
  spaceId: string;
}>({
  isCurrentUserOwner: false,
  spaceId: '',
});

export default RouteFlowContext;

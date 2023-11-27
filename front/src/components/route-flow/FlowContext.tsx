import { createContext } from "react";

const FlowContext = createContext<{
  isCurrentUserOwner: boolean;
}>({
  isCurrentUserOwner: false,
});

export default FlowContext;

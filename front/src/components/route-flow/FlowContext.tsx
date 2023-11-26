import { createContext } from "react";
import { FlowStore } from "./state/store-flow-state";

const FlowContext = createContext<{
  flowStore?: FlowStore;
  isCurrentUserOwner: boolean;
}>({
  isCurrentUserOwner: false,
});

export default FlowContext;

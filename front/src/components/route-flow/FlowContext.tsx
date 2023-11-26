import { createContext } from "react";
import { FlowStore } from "./store/store-flow-state";

const FlowContext = createContext<{
  flowStore?: FlowStore;
  isCurrentUserOwner: boolean;
}>({
  isCurrentUserOwner: false,
});

export default FlowContext;

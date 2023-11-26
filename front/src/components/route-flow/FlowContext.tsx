import { createContext } from "react";
import { FlowStore } from "./store";

const FlowContext = createContext<{
  flowStore?: FlowStore;
  isCurrentUserOwner: boolean;
}>({
  isCurrentUserOwner: false,
});

export default FlowContext;

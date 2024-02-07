import { MutableFlowNodeGraph } from './FlowExecutionContext';

export default class NodeExecutionContext {
  constructor(public flowNodeGraph: MutableFlowNodeGraph) {}
}

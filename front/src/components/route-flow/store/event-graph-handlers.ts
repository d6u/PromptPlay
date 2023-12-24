import { A, D } from '@mobily/ts-belt';
import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import {
  Condition,
  EdgeID,
  FlowInputVariable,
  FlowOutputVariable,
  LocalNode,
  NodeID,
  NodeInputVariable,
  NodeOutputVariable,
  NodeType,
  V3LocalEdge,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3VariableID,
  V3VariableValueLookUpDict,
  Variable,
  VariableType,
  VariableValueType,
  VariablesDict,
  asV3VariableID,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
import { current, produce } from 'immer';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import invariant from 'ts-invariant';
import { DRAG_HANDLE_CLASS_NAME } from '../constants';
import { ChangeEvent, ChangeEventType } from './event-graph-types';
import { CsvEvaluationConfigContent } from './slice-csv-evaluation-preset';
import { assignLocalEdgeProperties } from './state-utils';
import { FlowState } from './store-flow-state-types';

type EventHandlerResult = [Partial<FlowState>, ChangeEvent[]];

export function handleEvent(
  state: FlowState,
  event: ChangeEvent,
): EventHandlerResult {
  console.debug(event.type, D.deleteKey(event, 'type'));

  switch (event.type) {
    // React Flow
    case ChangeEventType.RF_EDGES_CHANGE:
      return handleRfEdgeChanges(event.changes, state.edges);
    case ChangeEventType.RF_NODES_CHANGE:
      return handleRfNodesChange(
        event.changes,
        state.nodes,
        state.nodeConfigsDict,
      );
    case ChangeEventType.RF_ON_CONNECT:
      return handleRfOnConnect(
        event.connection,
        state.edges,
        state.nodeConfigsDict,
        state.variablesDict,
      );
    // Nodes
    case ChangeEventType.ADDING_NODE:
      return handleAddingNode(
        event.node,
        state.nodes,
        state.nodeConfigsDict,
        state.variablesDict,
      );
    case ChangeEventType.REMOVING_NODE:
      return handleRemovingNode(
        event.nodeId,
        state.nodes,
        state.nodeConfigsDict,
      );
    case ChangeEventType.UPDATING_NODE_CONFIG:
      return handleUpdatingNodeConfig(
        event.nodeId,
        event.change,
        state.nodeConfigsDict,
      );
    // Variables
    case ChangeEventType.ADDING_VARIABLE:
      return handleAddingVariable(
        event.nodeId,
        event.varType,
        event.index,
        state.variablesDict,
      );
    case ChangeEventType.REMOVING_VARIABLE:
      return handleRemovingVariable(event.variableId, state.variablesDict);
    case ChangeEventType.UPDATING_VARIABLE:
      return handleUpdatingVariable(
        event.variableId,
        event.change,
        state.variablesDict,
      );
    // ANCHOR: Derived
    // Derived Nodes
    case ChangeEventType.NODE_AND_VARIABLES_ADDED:
      return handleNodeAndVariablesAdded(
        event.variableConfigList,
        state.variableValueLookUpDicts,
      );
    case ChangeEventType.NODE_REMOVED:
      return handleNodeRemoved(
        event.node,
        event.nodeConfig,
        state.variablesDict,
      );
    case ChangeEventType.NODE_MOVED:
      return [state, []];
    case ChangeEventType.NODE_CONFIG_UPDATED:
      return [state, []];
    // Derived Edges
    case ChangeEventType.EDGE_ADDED:
      return handleEdgeAdded(event.edge, state.variablesDict);
    case ChangeEventType.EDGE_REMOVED:
      return handleEdgeRemoved(
        event.removedEdge,
        event.edgeSrcVariableConfig,
        state.variablesDict,
      );
    case ChangeEventType.EDGE_REPLACED:
      return handleEdgeReplaced(
        event.oldEdge,
        event.newEdge,
        state.variablesDict,
      );
    // Derived Variables
    case ChangeEventType.VARIABLE_ADDED:
      return handleVariableAdded(
        event.variableId,
        state.variableValueLookUpDicts,
      );
    case ChangeEventType.VARIABLE_REMOVED:
      return handleVariableRemoved({
        removedVariable: event.removedVariable,
        prevEdges: state.edges,
        prevVariableValueMaps: state.variableValueLookUpDicts,
        prevCsvEvaluationConfigContent: state.csvEvaluationConfigContent,
      });
    case ChangeEventType.VARIABLE_UPDATED:
      return handleVariableUpdated(
        event.prevVariableConfig,
        event.nextVariableConfig,
        state.variableValueLookUpDicts,
      );
    // Derived Conditions
    case ChangeEventType.CONDITION_ADDED:
      return [state, []];
    case ChangeEventType.CONDITION_REMOVED:
      return handleConditionRemoved(event.removedCondition, state.edges);
    case ChangeEventType.CONDITION_TARGET_REMOVED:
      return [state, []];
    // Derived Other
    case ChangeEventType.VAR_VALUE_MAP_UPDATED:
      return [state, []];
  }
}

function handleRfEdgeChanges(
  changes: EdgeChange[],
  currentEdges: V3LocalEdge[],
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const oldEdges = currentEdges;
  const newEdges = applyEdgeChanges(changes, oldEdges) as V3LocalEdge[];

  for (const change of changes) {
    switch (change.type) {
      case 'remove': {
        events.push({
          type: ChangeEventType.EDGE_REMOVED,
          removedEdge: oldEdges.find((edge) => edge.id === change.id)!,
          edgeSrcVariableConfig: null,
        });
        content.isFlowContentDirty = true;
        break;
      }
      case 'add':
      case 'select':
      case 'reset':
        break;
    }
  }

  content.edges = newEdges;

  return [content, events];
}

function handleRfNodesChange(
  changes: NodeChange[],
  prevNodes: LocalNode[],
  prevNodeConfigs: V3NodeConfigsDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const nextNodes = applyNodeChanges(changes, prevNodes) as LocalNode[];

  let nodeConfigs = prevNodeConfigs;

  for (const change of changes) {
    switch (change.type) {
      case 'remove': {
        const removingNodeConfig = nodeConfigs[change.id as NodeID]!;

        nodeConfigs = produce(nodeConfigs, (draft) => {
          delete draft[change.id as NodeID];
        });

        events.push({
          type: ChangeEventType.NODE_REMOVED,
          node: prevNodes.find((node) => node.id === change.id)!,
          nodeConfig: removingNodeConfig,
        });

        content.isFlowContentDirty = true;
        content.nodeConfigsDict = nodeConfigs;
        break;
      }
      case 'position': {
        if (!change.dragging) {
          events.push({
            type: ChangeEventType.NODE_MOVED,
          });

          content.isFlowContentDirty = true;
        }
        break;
      }
      case 'add':
      case 'select':
      case 'dimensions':
      case 'reset': {
        break;
      }
    }
  }

  content.nodes = nextNodes;

  return [content, events];
}

function handleRfOnConnect(
  connection: Connection,
  prevEdges: V3LocalEdge[],
  nodeConfigs: V3NodeConfigsDict,
  variablesDict: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  if (connection.source === connection.target) {
    // NOTE: Ignore self connection
    return [content, events];
  }

  const nextEdges = addEdge(connection, prevEdges) as V3LocalEdge[];
  const addedEdges = A.difference(nextEdges, prevEdges);

  if (addedEdges.length === 0) {
    // NOTE: This happens when connecting between two handles that are already
    // connected in React Flow.
    return [content, events];
  }

  const addedEdge = addedEdges[0]!;

  // Assign a shorter ID for readability
  addedEdge.id = randomId() as EdgeID;

  const srcVariable = variablesDict[addedEdge.sourceHandle];

  if (
    srcVariable.type === VariableType.FlowInput ||
    srcVariable.type === VariableType.FlowOutput ||
    srcVariable.type === VariableType.NodeInput ||
    srcVariable.type === VariableType.NodeOutput
  ) {
    // NOTE: New edge connects two variables

    // SECTION: Check if new edge has valid destination value type

    if (srcVariable.valueType === VariableValueType.Audio) {
      const dstNodeConfig = nodeConfigs[addedEdge.target];
      invariant(dstNodeConfig != null);
      if (dstNodeConfig.type !== NodeType.OutputNode) {
        // TODO: Change this to a non-blocking alert UI
        alert('You can only connect an audio output to an output node.');

        return [content, events];
      }
    }

    // !SECTION

    // SECTION: Check if this is a replacing or adding

    const [acceptedEdges, rejectedEdges] = A.partition(nextEdges, (edge) => {
      return (
        edge.id === addedEdge.id || edge.targetHandle !== addedEdge.targetHandle
      );
    });

    if (rejectedEdges.length) {
      const oldEdge = rejectedEdges[0];
      invariant(oldEdge != null);

      // Replace edge
      events.push({
        type: ChangeEventType.EDGE_REPLACED,
        oldEdge,
        newEdge: addedEdge,
      });
    } else {
      // Add edge
      events.push({
        type: ChangeEventType.EDGE_ADDED,
        edge: addedEdge,
      });
    }

    // !SECTION

    content.isFlowContentDirty = true;
    content.edges = assignLocalEdgeProperties(acceptedEdges, variablesDict);
  } else {
    // NOTE: New edge connects a condition and a condition target

    // NOTE: For condition edge, we allow same source with multiple targets
    // as well as same target with multiple sources. Thus, we won't generate
    // edge replace event.

    events.push({
      type: ChangeEventType.EDGE_ADDED,
      edge: addedEdge,
    });

    content.isFlowContentDirty = true;
    content.edges = assignLocalEdgeProperties(nextEdges, variablesDict);
  }

  return [content, events];
}

function handleAddingNode(
  node: LocalNode,
  prevNodes: LocalNode[],
  prevNodeConfigs: V3NodeConfigsDict,
  prevVariableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  // ANCHOR: Update node and variables

  const { nodeConfig, variableConfigList } = getNodeDefinitionForNodeTypeName(
    node.type,
  ).createDefaultNodeConfig(node);

  const nodes = produce(prevNodes, (draft) => {
    draft.push({
      ...node,
      dragHandle: `.${DRAG_HANDLE_CLASS_NAME}`,
    });
  });

  const nodeConfigs = produce(prevNodeConfigs, (draft) => {
    draft[node.id] = nodeConfig;
  });

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    for (const variableConfig of variableConfigList) {
      draft[variableConfig.id] = variableConfig;
    }
  });

  events.push({
    type: ChangeEventType.NODE_AND_VARIABLES_ADDED,
    node,
    variableConfigList,
  });

  content.isFlowContentDirty = true;
  content.nodes = nodes;
  content.nodeConfigsDict = nodeConfigs;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleRemovingNode(
  nodeId: NodeID,
  prevNodes: LocalNode[],
  prevNodeConfigs: V3NodeConfigsDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const [acceptedNodes, rejectedNodes] = A.partition(
    prevNodes,
    (node) => node.id !== nodeId,
  );

  let nodeConfigs = prevNodeConfigs;

  if (rejectedNodes.length) {
    // NOTE: There should be at most one rejected node, because this event
    // will only be triggered in UI for one node.

    const removingNodeConfig = prevNodeConfigs[nodeId];

    nodeConfigs = produce(prevNodeConfigs, (draft) => {
      delete draft[nodeId];
    });

    events.push({
      type: ChangeEventType.NODE_REMOVED,
      node: rejectedNodes[0]!,
      nodeConfig: removingNodeConfig,
    });
  }

  content.isFlowContentDirty = true;
  content.nodes = acceptedNodes;
  content.nodeConfigsDict = nodeConfigs;

  return [content, events];
}

function handleUpdatingNodeConfig(
  nodeId: NodeID,
  change: Partial<V3NodeConfig>,
  prevNodeConfigs: V3NodeConfigsDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const nodeConfigs = produce(prevNodeConfigs, (draft) => {
    Object.assign(draft[nodeId], change);
  });

  events.push({
    type: ChangeEventType.NODE_CONFIG_UPDATED,
  });

  content.isFlowContentDirty = true;
  content.nodeConfigsDict = nodeConfigs;

  return [content, events];
}

function handleAddingVariable(
  nodeId: NodeID,
  varType: VariableType,
  index: number,
  variableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  variableConfigs = produce(variableConfigs, (draft) => {
    const commonFields = {
      id: asV3VariableID(`${nodeId}/${randomId()}`),
      nodeId,
      index,
      name: chance.word(),
    };

    switch (varType) {
      case VariableType.NodeInput: {
        const variableConfig: NodeInputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.Unknown,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.NodeOutput: {
        const variableConfig: NodeOutputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.Unknown,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.FlowInput: {
        const variableConfig: FlowInputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.String,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.FlowOutput: {
        const variableConfig: FlowOutputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.String,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.Condition: {
        const variableConfig: Condition = {
          id: asV3VariableID(`${nodeId}/${randomId()}`),
          type: VariableType.Condition,
          nodeId,
          index,
          eq: 'some value',
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.ConditionTarget:
        break;
    }

    if (
      varType === VariableType.FlowInput ||
      varType === VariableType.FlowOutput ||
      varType === VariableType.NodeInput ||
      varType === VariableType.NodeOutput
    ) {
      events.push({
        type: ChangeEventType.VARIABLE_ADDED,
        variableId: commonFields.id,
      });
    } else if (varType === VariableType.Condition) {
      events.push({
        type: ChangeEventType.CONDITION_ADDED,
      });
    }
  });

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleRemovingVariable(
  variableId: V3VariableID,
  prevVariableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const connector = current(draft[variableId]);

    if (
      connector.type === VariableType.FlowInput ||
      connector.type === VariableType.FlowOutput ||
      connector.type === VariableType.NodeInput ||
      connector.type === VariableType.NodeOutput
    ) {
      events.push({
        type: ChangeEventType.VARIABLE_REMOVED,
        removedVariable: connector,
      });
    } else if (connector.type === VariableType.Condition) {
      events.push({
        type: ChangeEventType.CONDITION_REMOVED,
        removedCondition: connector,
      });
    }

    delete draft[variableId];
  });

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleUpdatingVariable(
  variableId: V3VariableID,
  change: Partial<Variable>,
  prevVariableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const prevVariableConfig = current(draft[variableId]);

    Object.assign(draft[variableId], change);

    events.push({
      type: ChangeEventType.VARIABLE_UPDATED,
      prevVariableConfig,
      nextVariableConfig: current(draft[variableId]),
    });
  });

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleNodeAndVariablesAdded(
  variableConfigList: Variable[],
  prevVariableValueMaps: V3VariableValueLookUpDict[],
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  // ANCHOR: Update variable values

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    for (const variableConfig of variableConfigList) {
      if (
        variableConfig.type === VariableType.FlowInput ||
        variableConfig.type === VariableType.FlowOutput ||
        variableConfig.type === VariableType.NodeInput ||
        variableConfig.type === VariableType.NodeOutput
      ) {
        draft[0][variableConfig.id] = null;
      }
    }
  });

  if (variableValueMaps !== prevVariableValueMaps) {
    events.push({
      type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
    });
  }

  content.isFlowContentDirty = variableValueMaps !== prevVariableValueMaps;
  content.variableValueLookUpDicts = variableValueMaps;

  return [content, events];
}

function handleNodeRemoved(
  removedNode: LocalNode,
  removedNodeConfig: V3NodeConfig,
  prevVariableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    for (const connector of D.values(draft)) {
      if (connector.nodeId !== removedNode.id) {
        continue;
      }

      const removedConnector = current(connector);

      if (
        removedConnector.type === VariableType.FlowInput ||
        removedConnector.type === VariableType.FlowOutput ||
        removedConnector.type === VariableType.NodeInput ||
        removedConnector.type === VariableType.NodeOutput
      ) {
        events.push({
          type: ChangeEventType.VARIABLE_REMOVED,
          removedVariable: removedConnector,
        });
      } else if (removedConnector.type === VariableType.Condition) {
        events.push({
          type: ChangeEventType.CONDITION_REMOVED,
          removedCondition: removedConnector,
        });
      } else {
        invariant(removedConnector.type === VariableType.ConditionTarget);
        events.push({
          type: ChangeEventType.CONDITION_TARGET_REMOVED,
        });
      }

      delete draft[connector.id];
    }
  });

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleEdgeAdded(
  addedEdge: V3LocalEdge,
  prevVariableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const srcVariableConfig = draft[asV3VariableID(addedEdge.sourceHandle)];

    if (
      srcVariableConfig.type === VariableType.FlowInput ||
      srcVariableConfig.type === VariableType.FlowOutput ||
      srcVariableConfig.type === VariableType.NodeInput ||
      srcVariableConfig.type === VariableType.NodeOutput
    ) {
      if (srcVariableConfig.valueType === VariableValueType.Audio) {
        const dstVariableConfig = draft[asV3VariableID(addedEdge.targetHandle)];

        invariant(dstVariableConfig.type === VariableType.FlowOutput);

        const prevVariableConfig = current(dstVariableConfig);

        dstVariableConfig.valueType = VariableValueType.Audio;

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          prevVariableConfig,
          nextVariableConfig: current(dstVariableConfig),
        });
      }
    }
  });

  content.isFlowContentDirty = variableConfigs !== prevVariableConfigs;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleEdgeRemoved(
  removedEdge: V3LocalEdge,
  edgeSrcConnector: Variable | null,
  prevVariableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  // SECTION: Variable Type

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    if (draft[removedEdge.targetHandle] == null) {
      // NOTE: Edge was removed because destination variable was removed.
      // Do nothing in this case.
      return;
    }

    const srcConnector = edgeSrcConnector ?? draft[removedEdge.sourceHandle];

    if (
      srcConnector.type === VariableType.FlowInput ||
      srcConnector.type === VariableType.FlowOutput ||
      srcConnector.type === VariableType.NodeInput ||
      srcConnector.type === VariableType.NodeOutput
    ) {
      invariant(
        srcConnector.type === VariableType.FlowInput ||
          srcConnector.type === VariableType.NodeOutput,
      );

      if (srcConnector.valueType === VariableValueType.Audio) {
        // NOTE: Source variable of removed edge is audio.
        // We need to change the destination variable back to default type.

        const dstConnector = draft[asV3VariableID(removedEdge.targetHandle)];
        invariant(dstConnector.type === VariableType.FlowOutput);

        const prevVariableConfig = current(dstConnector);

        dstConnector.valueType = VariableValueType.String;

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          prevVariableConfig,
          nextVariableConfig: current(dstConnector),
        });
      }
    }
  });

  // !SECTION

  content.isFlowContentDirty = variableConfigs !== prevVariableConfigs;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleEdgeReplaced(
  oldEdge: V3LocalEdge,
  newEdge: V3LocalEdge,
  prevVariableConfigs: VariablesDict,
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  // NOTE: There won't be edge replaced event for edges between condition
  // and condition target.

  // SECTION: Variable type

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const oldSrcVariableConfig = draft[oldEdge.sourceHandle];
    const newSrcVariableConfig = draft[newEdge.sourceHandle];

    invariant(
      oldSrcVariableConfig.type === VariableType.FlowInput ||
        oldSrcVariableConfig.type === VariableType.NodeOutput,
    );
    invariant(
      newSrcVariableConfig.type === VariableType.FlowInput ||
        newSrcVariableConfig.type === VariableType.NodeOutput,
    );

    if (oldSrcVariableConfig.valueType !== newSrcVariableConfig.valueType) {
      // It doesn't matter whether we use the old or the new edge to find the
      // destination variable config, they should point to the same one.
      const dstVariableConfig = draft[asV3VariableID(newEdge.targetHandle)];

      invariant(
        dstVariableConfig.type === VariableType.FlowOutput ||
          dstVariableConfig.type === VariableType.NodeInput,
      );

      const prevVariableConfig = current(dstVariableConfig);

      switch (newSrcVariableConfig.valueType) {
        case VariableValueType.Number:
          if (dstVariableConfig.type === VariableType.FlowOutput) {
            dstVariableConfig.valueType = VariableValueType.String;
          } else {
            dstVariableConfig.valueType = VariableValueType.Unknown;
          }
          break;
        case VariableValueType.String:
          if (dstVariableConfig.type === VariableType.FlowOutput) {
            dstVariableConfig.valueType = VariableValueType.String;
          } else {
            dstVariableConfig.valueType = VariableValueType.Unknown;
          }
          break;
        case VariableValueType.Audio:
          invariant(dstVariableConfig.type === VariableType.FlowOutput);
          dstVariableConfig.valueType = VariableValueType.Audio;
          break;
        case VariableValueType.Unknown:
          if (dstVariableConfig.type === VariableType.FlowOutput) {
            dstVariableConfig.valueType = VariableValueType.String;
          } else {
            dstVariableConfig.valueType = VariableValueType.Unknown;
          }
          break;
      }

      events.push({
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig,
        nextVariableConfig: current(dstVariableConfig),
      });
    }
  });

  // !SECTION

  content.isFlowContentDirty = variableConfigs !== prevVariableConfigs;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleVariableAdded(
  variableId: V3VariableID,
  prevVariableValueMaps: V3VariableValueLookUpDict[],
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    draft[0][variableId] = null;
  });

  events.push({
    type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
  });

  content.isFlowContentDirty = true;
  content.variableValueLookUpDicts = variableValueMaps;

  return [content, events];
}

function handleVariableRemoved({
  removedVariable,
  prevEdges,
  prevVariableValueMaps,
  prevCsvEvaluationConfigContent,
}: {
  removedVariable: Variable;
  prevEdges: V3LocalEdge[];
  prevVariableValueMaps: V3VariableValueLookUpDict[];
  prevCsvEvaluationConfigContent: CsvEvaluationConfigContent;
}): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  // SECTION: Process Edges Removal

  const [acceptedEdges, rejectedEdges] = A.partition(
    prevEdges,
    (edge) =>
      edge.sourceHandle !== removedVariable.id &&
      edge.targetHandle !== removedVariable.id,
  );

  for (const removingEdge of rejectedEdges) {
    events.push({
      type: ChangeEventType.EDGE_REMOVED,
      removedEdge: removingEdge,
      edgeSrcVariableConfig:
        removedVariable.id === removingEdge.sourceHandle
          ? removedVariable
          : null,
    });
  }

  // !SECTION

  // SECTION: Process variable map value update

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    delete draft[0][removedVariable.id];
  });

  events.push({
    type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
  });

  // !SECTION

  // SECTION: Remove Variable ID to column index mapping in
  // CSV Evaluation Config Content

  const csvEvaluationConfigContent = produce(
    prevCsvEvaluationConfigContent,
    (draft) => {
      delete draft.variableIdToCsvColumnIndexMap[removedVariable.id];
    },
  );

  // !SECTION

  content.isFlowContentDirty = true;
  content.edges = acceptedEdges;
  content.variableValueLookUpDicts = variableValueMaps;
  content.csvEvaluationConfigContent = csvEvaluationConfigContent;

  return [content, events];
}

function handleVariableUpdated(
  prevVariableConfig: Variable,
  nextVariableConfig: Variable,
  prevVariableValueMaps: V3VariableValueLookUpDict[],
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    if (
      (prevVariableConfig.type === VariableType.FlowInput ||
        prevVariableConfig.type === VariableType.FlowOutput ||
        prevVariableConfig.type === VariableType.NodeInput ||
        prevVariableConfig.type === VariableType.NodeOutput) &&
      (nextVariableConfig.type === VariableType.FlowInput ||
        nextVariableConfig.type === VariableType.FlowOutput ||
        nextVariableConfig.type === VariableType.NodeInput ||
        nextVariableConfig.type === VariableType.NodeOutput)
    ) {
      if (prevVariableConfig.valueType !== nextVariableConfig.valueType) {
        draft[0][nextVariableConfig.id] = null;
      }
    }
  });

  content.isFlowContentDirty = true;
  content.variableValueLookUpDicts = variableValueMaps;

  return [content, events];
}

function handleConditionRemoved(
  removedCondition: Condition,
  prevEdges: V3LocalEdge[],
): EventHandlerResult {
  const content: Partial<FlowState> = {};
  const events: ChangeEvent[] = [];

  // SECTION: Process Edges Removal

  const [acceptedEdges, rejectedEdges] = A.partition(
    prevEdges,
    (edge) =>
      edge.sourceHandle !== removedCondition.id &&
      edge.targetHandle !== removedCondition.id,
  );

  for (const removingEdge of rejectedEdges) {
    events.push({
      type: ChangeEventType.EDGE_REMOVED,
      removedEdge: removingEdge,
      // NOTE: If the removed connector is a source handle, assign it here.
      edgeSrcVariableConfig:
        removedCondition.id === removingEdge.sourceHandle
          ? removedCondition
          : null,
    });
  }

  // !SECTION

  content.isFlowContentDirty = rejectedEdges.length > 0;
  content.edges = acceptedEdges;

  return [content, events];
}

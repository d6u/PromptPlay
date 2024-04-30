import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  VariableValueRecords,
} from 'flow-models';
import type { Edge } from 'reactflow';
import type { RunFlowStates } from '../types';

export function createFxitureForTwoIncomingEdgesForOneCondition() {
  const edges: Edge[] = [
    {
      id: 'ufmj3',
      source: 'jswKV',
      sourceHandle: 'jswKV/yN6kp',
      target: 'coZ0B',
      targetHandle: 'coZ0B/WQ6WM',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'p8tGn',
      source: '8jIMr',
      sourceHandle: '8jIMr/PEHuV',
      target: 'coZ0B',
      targetHandle: 'coZ0B/WQ6WM',
      style: {
        strokeWidth: 2,
      },
    },
  ];

  const nodeConfigs: Record<string, NodeAllLevelConfigUnion> = {
    '8jIMr': {
      kind: 'Start',
      type: 'InputNode',
      nodeId: '8jIMr',
      nodeName: 'input',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    'jswKV': {
      kind: 'Start',
      type: 'InputNode',
      nodeId: 'jswKV',
      nodeName: 'input',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    'coZ0B': {
      kind: 'Process',
      type: 'TextTemplate',
      nodeId: 'coZ0B',
      inputVariableIds: [],
      outputVariableIds: ['coZ0B/content'],
      content: 'Write a poem about {{topic}} in fewer than 20 words.',
    },
  };

  const connectors: ConnectorRecords = {
    '8jIMr/PEHuV': {
      type: 'OutCondition',
      id: '8jIMr/PEHuV',
      nodeId: '8jIMr',
      index: 0,
      expressionString: '',
    },
    'coZ0B/EV4kO': {
      type: 'OutCondition',
      id: 'coZ0B/EV4kO',
      nodeId: 'coZ0B',
      index: 0,
      expressionString: '',
    },
    'coZ0B/WQ6WM': {
      type: 'InCondition',
      id: 'coZ0B/WQ6WM',
      nodeId: 'coZ0B',
    },
    'jswKV/yN6kp': {
      type: 'OutCondition',
      id: 'jswKV/yN6kp',
      nodeId: 'jswKV',
      index: 0,
      expressionString: '',
    },
    'coZ0B/content': {
      type: 'NodeOutput',
      id: 'coZ0B/content',
      name: 'content',
      nodeId: 'coZ0B',
      valueType: 'String',
      isGlobal: false,
      globalVariableId: null,
    },
  };

  const inputVariableValues: VariableValueRecords = {};

  const startNodeId1 = '8jIMr';
  const startNodeId2 = 'jswKV';
  const processNodeId = 'coZ0B';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    startNodeId1,
    startNodeId2,
    processNodeId,
  };
}

export function createInitialRunStatesForTwoIncomingEdgesForOneCondition(): RunFlowStates {
  return {
    nodeStates: {
      '8jIMr': 'PENDING',
      'jswKV': 'PENDING',
      'coZ0B': 'PENDING',
    },
    connectorStates: {
      '8jIMr/PEHuV': 'PENDING',
      'coZ0B/EV4kO': 'UNCONNECTED',
      'coZ0B/WQ6WM': 'PENDING',
      'jswKV/yN6kp': 'PENDING',
      'coZ0B/content': 'UNCONNECTED',
    },
    edgeStates: {
      ufmj3: 'PENDING',
      p8tGn: 'PENDING',
    },
  };
}

export function createStartNode1SKIPPEDStateForTwoIncomingEdgesForOneCondition(): RunFlowStates {
  return {
    nodeStates: {
      '8jIMr': 'SKIPPED',
      'jswKV': 'PENDING',
      'coZ0B': 'PENDING',
    },
    connectorStates: {
      '8jIMr/PEHuV': 'SKIPPED',
      'coZ0B/EV4kO': 'UNCONNECTED',
      'coZ0B/WQ6WM': 'PENDING',
      'jswKV/yN6kp': 'PENDING',
      'coZ0B/content': 'UNCONNECTED',
    },
    edgeStates: {
      ufmj3: 'PENDING',
      p8tGn: 'SKIPPED',
    },
  };
}

export function createStartNode1SUCCEEDEDForTwoIncomingEdgesForOneCondition(): RunFlowStates {
  return {
    nodeStates: {
      '8jIMr': 'SUCCEEDED',
      'jswKV': 'PENDING',
      'coZ0B': 'PENDING',
    },
    connectorStates: {
      '8jIMr/PEHuV': 'MET',
      'coZ0B/EV4kO': 'UNCONNECTED',
      'coZ0B/WQ6WM': 'MET',
      'jswKV/yN6kp': 'PENDING',
      'coZ0B/content': 'UNCONNECTED',
    },
    edgeStates: {
      ufmj3: 'PENDING',
      p8tGn: 'MET',
    },
  };
}

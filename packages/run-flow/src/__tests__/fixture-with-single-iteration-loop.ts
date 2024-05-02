import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  VariableValueRecords,
} from 'flow-models';
import type { Edge } from 'reactflow';

export function createFixtureWithSingleIterationLoop() {
  const edges: Edge[] = [
    {
      id: 'OoWtb',
      source: '38HOp',
      sourceHandle: '38HOp/y9Q1s',
      target: '5zGHI',
      targetHandle: '5zGHI/FHe5e',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'S0ydj',
      source: '5zGHI',
      sourceHandle: '5zGHI/PKHRY',
      target: '6JF8I',
      targetHandle: '6JF8I/ueOE5',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'kjPG4',
      source: '1jqsX',
      sourceHandle: '1jqsX/lp95M',
      target: 'xo62m',
      targetHandle: 'xo62m/3C4ap',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'NzsWq',
      source: 'xo62m',
      sourceHandle: 'xo62m/krar0',
      target: 'YSzqp',
      targetHandle: 'YSzqp/nqQah',
      style: {
        strokeWidth: 2,
      },
    },
  ];

  const nodeConfigs: Record<string, NodeAllLevelConfigUnion> = {
    '1jqsX': {
      kind: 'SubroutineStart',
      type: 'LoopStart',
      nodeId: '1jqsX',
      nodeName: 'loop start 1',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    '38HOp': {
      kind: 'Start',
      type: 'InputNode',
      nodeId: '38HOp',
      nodeName: 'input',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    '5zGHI': {
      kind: 'Subroutine',
      type: 'BareboneLoop',
      nodeId: '5zGHI',
      loopStartNodeId: '1jqsX',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    '6JF8I': {
      kind: 'Finish',
      type: 'OutputNode',
      nodeId: '6JF8I',
      inputVariableIds: ['6JF8I/frGQv'],
      outputVariableIds: [],
    },
    'YSzqp': {
      kind: 'Finish',
      type: 'LoopFinish',
      nodeId: 'YSzqp',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    'xo62m': {
      kind: 'Process',
      type: 'TextTemplate',
      nodeId: 'xo62m',
      inputVariableIds: [],
      outputVariableIds: ['xo62m/content'],
      content: 'test value 1',
    },
  };

  const connectors: ConnectorRecords = {
    '1jqsX/lp95M': {
      type: 'OutCondition',
      id: '1jqsX/lp95M',
      nodeId: '1jqsX',
      index: 0,
      expressionString: '',
    },
    '38HOp/y9Q1s': {
      type: 'OutCondition',
      id: '38HOp/y9Q1s',
      nodeId: '38HOp',
      index: 0,
      expressionString: '',
    },
    '5zGHI/FHe5e': {
      type: 'InCondition',
      id: '5zGHI/FHe5e',
      nodeId: '5zGHI',
      index: 0,
    },
    '5zGHI/PKHRY': {
      type: 'OutCondition',
      id: '5zGHI/PKHRY',
      nodeId: '5zGHI',
      index: 0,
      expressionString: '',
    },
    '6JF8I/frGQv': {
      type: 'NodeInput',
      id: '6JF8I/frGQv',
      name: 'output_val1',
      nodeId: '6JF8I',
      valueType: 'Any',
      isGlobal: true,
      globalVariableId: 'aGGCt',
    },
    '6JF8I/ueOE5': {
      type: 'InCondition',
      id: '6JF8I/ueOE5',
      nodeId: '6JF8I',
    },
    'YSzqp/nqQah': {
      type: 'InCondition',
      id: 'YSzqp/nqQah',
      nodeId: 'YSzqp',
      index: 1,
    },
    'YSzqp/xtCmJ': {
      type: 'InCondition',
      id: 'YSzqp/xtCmJ',
      nodeId: 'YSzqp',
      index: 0,
    },
    'xo62m/3C4ap': {
      type: 'InCondition',
      id: 'xo62m/3C4ap',
      nodeId: 'xo62m',
    },
    'xo62m/krar0': {
      type: 'OutCondition',
      id: 'xo62m/krar0',
      nodeId: 'xo62m',
      index: 0,
      expressionString: '',
    },
    'xo62m/content': {
      type: 'NodeOutput',
      id: 'xo62m/content',
      name: 'content',
      nodeId: 'xo62m',
      valueType: 'String',
      isGlobal: true,
      globalVariableId: 'aGGCt',
    },
  };

  const inputVariableValues: VariableValueRecords = {};

  const startNodeId = '38HOp';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    startNodeId,
  };
}

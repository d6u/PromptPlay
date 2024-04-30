import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  VariableValueRecords,
} from 'flow-models';
import type { Edge } from 'reactflow';

export function createFixtureWithMultipleIterationsLoop() {
  const edges: Edge[] = [
    {
      id: 'TbP5m',
      source: 'OLdFn',
      sourceHandle: 'OLdFn/NXJ2v',
      target: 'HLDHJ',
      targetHandle: 'HLDHJ/guI9U',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'm0yWT',
      source: 'HLDHJ',
      sourceHandle: 'HLDHJ/WwHBK',
      target: '771RQ',
      targetHandle: '771RQ/Jg2y4',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'ez5PR',
      source: '97TDT',
      sourceHandle: '97TDT/QO3qt',
      target: 'vAG7s',
      targetHandle: 'vAG7s/n4gXk',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'VRif8',
      source: 'vAG7s',
      sourceHandle: 'vAG7s/jopZe',
      target: 'PR4rf',
      targetHandle: 'PR4rf/VsMSq',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'ZI0xz',
      source: 'PR4rf',
      sourceHandle: 'PR4rf/nV4jC',
      target: 'G7bsz',
      targetHandle: 'G7bsz/XSKf8',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: 'GrOD9',
      source: 'PR4rf',
      sourceHandle: 'PR4rf/qVd56',
      target: 'G7bsz',
      targetHandle: 'G7bsz/HJxkW',
      style: {
        strokeWidth: 2,
      },
    },
  ];

  const nodeConfigs: Record<string, NodeAllLevelConfigUnion> = {
    'OLdFn': {
      kind: 'Start',
      type: 'InputNode',
      nodeId: 'OLdFn',
      nodeName: 'input',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    '771RQ': {
      kind: 'Finish',
      type: 'OutputNode',
      nodeId: '771RQ',
      inputVariableIds: ['771RQ/tQ7Ul'],
      outputVariableIds: [],
    },
    '97TDT': {
      kind: 'SubroutineStart',
      type: 'LoopStart',
      nodeId: '97TDT',
      inputVariableIds: [],
      outputVariableIds: [],
      nodeName: 'loop start 1',
    },
    'G7bsz': {
      kind: 'Finish',
      type: 'LoopFinish',
      nodeId: 'G7bsz',
      inputVariableIds: [],
      outputVariableIds: [],
    },
    'HLDHJ': {
      kind: 'Subroutine',
      type: 'BareboneLoop',
      nodeId: 'HLDHJ',
      inputVariableIds: [],
      outputVariableIds: [],
      loopStartNodeId: '97TDT',
    },
    'PR4rf': {
      kind: 'Condition',
      type: 'JSONataCondition',
      nodeId: 'PR4rf',
      inputVariableIds: ['PR4rf/input'],
      outputVariableIds: [],
      stopAtTheFirstMatch: true,
    },
    'vAG7s': {
      kind: 'Process',
      type: 'JavaScriptFunctionNode',
      nodeId: 'vAG7s',
      inputVariableIds: ['vAG7s/2c81K'],
      outputVariableIds: ['vAG7s/output'],
      javaScriptCode: 'i = i ?? 0\ni++\nreturn i',
    },
  };

  const connectors: ConnectorRecords = {
    '771RQ/Jg2y4': {
      type: 'InCondition',
      id: '771RQ/Jg2y4',
      nodeId: '771RQ',
    },
    '771RQ/tQ7Ul': {
      type: 'NodeInput',
      id: '771RQ/tQ7Ul',
      name: 'output_val1',
      nodeId: '771RQ',
      valueType: 'Any',
      isGlobal: true,
      globalVariableId: 'vbiQR',
    },
    '97TDT/QO3qt': {
      type: 'OutCondition',
      id: '97TDT/QO3qt',
      nodeId: '97TDT',
      index: 0,
      expressionString: '',
    },
    'G7bsz/HJxkW': {
      type: 'InCondition',
      id: 'G7bsz/HJxkW',
      nodeId: 'G7bsz',
      index: 1,
    },
    'G7bsz/XSKf8': {
      type: 'InCondition',
      id: 'G7bsz/XSKf8',
      nodeId: 'G7bsz',
      index: 0,
    },
    'HLDHJ/WwHBK': {
      type: 'OutCondition',
      id: 'HLDHJ/WwHBK',
      nodeId: 'HLDHJ',
      index: 0,
      expressionString: '',
    },
    'HLDHJ/guI9U': {
      type: 'InCondition',
      id: 'HLDHJ/guI9U',
      nodeId: 'HLDHJ',
      index: 0,
    },
    'OLdFn/NXJ2v': {
      type: 'OutCondition',
      id: 'OLdFn/NXJ2v',
      nodeId: 'OLdFn',
      index: 0,
      expressionString: '',
    },
    'PR4rf/VsMSq': {
      type: 'InCondition',
      id: 'PR4rf/VsMSq',
      nodeId: 'PR4rf',
    },
    'PR4rf/input': {
      type: 'NodeInput',
      id: 'PR4rf/input',
      name: 'input',
      nodeId: 'PR4rf',
      valueType: 'Any',
      isGlobal: true,
      globalVariableId: 'vbiQR',
    },
    'PR4rf/nV4jC': {
      type: 'OutCondition',
      id: 'PR4rf/nV4jC',
      nodeId: 'PR4rf',
      index: 1,
      expressionString: '$ < 3',
    },
    'PR4rf/qVd56': {
      type: 'OutCondition',
      id: 'PR4rf/qVd56',
      nodeId: 'PR4rf',
      index: -1,
      expressionString: '',
    },
    'vAG7s/2c81K': {
      type: 'NodeInput',
      id: 'vAG7s/2c81K',
      name: 'i',
      nodeId: 'vAG7s',
      valueType: 'Any',
      isGlobal: true,
      globalVariableId: 'vbiQR',
    },
    'vAG7s/jopZe': {
      type: 'OutCondition',
      id: 'vAG7s/jopZe',
      nodeId: 'vAG7s',
      index: 0,
      expressionString: '',
    },
    'vAG7s/n4gXk': {
      type: 'InCondition',
      id: 'vAG7s/n4gXk',
      nodeId: 'vAG7s',
    },
    'vAG7s/output': {
      type: 'NodeOutput',
      id: 'vAG7s/output',
      name: 'output',
      nodeId: 'vAG7s',
      valueType: 'Structured',
      isGlobal: true,
      globalVariableId: 'vbiQR',
    },
  };

  const inputVariableValues: VariableValueRecords = {};

  const startNodeId = 'OLdFn';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    startNodeId,
  };
}

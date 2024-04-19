import type { Edge } from 'reactflow';

import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  VariableValueRecords,
} from 'flow-models';

export function createFixtureForNodeClassStart() {
  const edges: Edge[] = [];

  const nodeConfigs: Record<string, NodeAllLevelConfigUnion> = {
    PM5i4: {
      class: 'Start',
      type: 'InputNode',
      nodeId: 'PM5i4',
      nodeName: 'input1',
    },
  };

  const connectors: ConnectorRecords = {
    'PM5i4/4zxZ6': {
      type: 'NodeOutput',
      id: 'PM5i4/4zxZ6',
      name: 'input_val2',
      nodeId: 'PM5i4',
      index: 1,
      valueType: 'String',
      isGlobal: false,
      globalVariableId: null,
    },
    'PM5i4/hbg4s': {
      type: 'NodeOutput',
      id: 'PM5i4/hbg4s',
      name: 'input_val1',
      nodeId: 'PM5i4',
      index: 0,
      valueType: 'String',
      isGlobal: true,
      globalVariableId: 'GTCdE',
    },
    'PM5i4/sMBfz': {
      type: 'OutCondition',
      id: 'PM5i4/sMBfz',
      nodeId: 'PM5i4',
      index: 0,
      expressionString: '',
    },
  };

  const inputVariableValues: VariableValueRecords = {
    'GTCdE': { value: 'test 1' },
    'PM5i4/4zxZ6': { value: 'test 2' },
  };

  const currentNodeId = 'PM5i4';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    currentNodeId,
  };
}

export function createFixtureForNodeClassProcess() {
  const edges: Edge[] = [
    {
      id: '84q9B',
      source: 'PM5i4',
      sourceHandle: 'PM5i4/hbg4s',
      target: 'hstPg',
      targetHandle: 'hstPg/XrU7m',
    },
  ];

  const nodeConfigs: Record<string, NodeAllLevelConfigUnion> = {
    PM5i4: {
      class: 'Start',
      type: 'InputNode',
      nodeId: 'PM5i4',
      nodeName: 'input1',
    },
    hstPg: {
      class: 'Process',
      type: 'TextTemplate',
      nodeId: 'hstPg',
      content: '',
    },
  };

  const connectors: ConnectorRecords = {
    'PM5i4/4zxZ6': {
      type: 'NodeOutput',
      id: 'PM5i4/4zxZ6',
      name: 'start_input_val2',
      nodeId: 'PM5i4',
      index: 1,
      valueType: 'String',
      isGlobal: true,
      globalVariableId: 'GTCdE',
    },
    'PM5i4/hbg4s': {
      type: 'NodeOutput',
      id: 'PM5i4/hbg4s',
      name: 'start_input_val1',
      nodeId: 'PM5i4',
      index: 0,
      valueType: 'String',
      isGlobal: false,
      globalVariableId: null,
    },
    'PM5i4/sMBfz': {
      type: 'OutCondition',
      id: 'PM5i4/sMBfz',
      nodeId: 'PM5i4',
      index: 0,
      expressionString: '',
    },
    'hstPg/3neA2': {
      type: 'InCondition',
      id: 'hstPg/3neA2',
      nodeId: 'hstPg',
    },
    'hstPg/I3lzc': {
      type: 'NodeInput',
      id: 'hstPg/I3lzc',
      name: 'input_val4',
      nodeId: 'hstPg',
      index: 3,
      valueType: 'String',
      isGlobal: true,
      globalVariableId: null,
    },
    'hstPg/Tw8g0': {
      type: 'NodeInput',
      id: 'hstPg/Tw8g0',
      name: 'input_val3',
      nodeId: 'hstPg',
      index: 2,
      valueType: 'String',
      isGlobal: false,
      globalVariableId: null,
    },
    'hstPg/XrU7m': {
      type: 'NodeInput',
      id: 'hstPg/XrU7m',
      name: 'input_val1',
      nodeId: 'hstPg',
      index: 0,
      valueType: 'String',
      isGlobal: false,
      globalVariableId: null,
    },
    'hstPg/c4Ts9': {
      type: 'OutCondition',
      id: 'hstPg/c4Ts9',
      nodeId: 'hstPg',
      index: 0,
      expressionString: '',
    },
    'hstPg/g3NPR': {
      type: 'NodeInput',
      id: 'hstPg/g3NPR',
      name: 'input_val2',
      nodeId: 'hstPg',
      index: 1,
      valueType: 'String',
      isGlobal: true,
      globalVariableId: 'GTCdE',
    },
    'hstPg/content': {
      type: 'NodeOutput',
      id: 'hstPg/content',
      name: 'content',
      nodeId: 'hstPg',
      index: 0,
      valueType: 'String',
      isGlobal: false,
      globalVariableId: null,
    },
  };

  const inputVariableValues: VariableValueRecords = {
    'PM5i4/hbg4s': { value: 'test 1' },
    'GTCdE': { value: 'test 2' },
  };

  const previousNodeNodeId = 'PM5i4';
  const currentNodeId = 'hstPg';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    previousNodeNodeId,
    currentNodeId,
  };
}

export function createFixtureForNodeClassFinish() {
  const edges: Edge[] = [];

  const nodeConfigs: Record<string, NodeAllLevelConfigUnion> = {
    '23u6c': {
      class: 'Finish',
      type: 'OutputNode',
      nodeId: '23u6c',
    },
  };

  const connectors: ConnectorRecords = {
    '23u6c/QWCNF': {
      type: 'NodeInput',
      id: '23u6c/QWCNF',
      name: 'output_var2',
      nodeId: '23u6c',
      index: 1,
      valueType: 'Any',
      isGlobal: true,
      globalVariableId: 'qij6C',
    },
    '23u6c/bxr8O': {
      type: 'NodeInput',
      id: '23u6c/bxr8O',
      name: 'output_var1',
      nodeId: '23u6c',
      index: 0,
      valueType: 'Any',
      isGlobal: false,
      globalVariableId: null,
    },
    '23u6c/ndnOy': {
      type: 'InCondition',
      id: '23u6c/ndnOy',
      nodeId: '23u6c',
    },
  };

  const inputVariableValues: VariableValueRecords = {
    qij6C: { value: 'test 2' },
  };

  const currentNodeId = '23u6c';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    currentNodeId,
  };
}

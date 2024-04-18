import type { Edge } from 'reactflow';
import { ReplaySubject } from 'rxjs';
import { expect, test } from 'vitest';

import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  RunNodeParams,
  TextTemplateNodeAllLevelConfig,
  VariableValueRecords,
} from 'flow-models';

import RunFlowContext from '../RunFlowContext';
import type { RunFlowParams } from '../types';

function createFixtureForNodeClassStart() {
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

  const startNodeId = 'PM5i4';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    startNodeId,
  };
}

function createFixtureForNodeClassNoneStart() {
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

  const startNodeId = 'hstPg';

  return {
    edges,
    nodeConfigs,
    connectors,
    inputVariableValues,
    startNodeId,
  };
}

test('RunNodeContext::getInputVariableValues() should handle Start node class', () => {
  // SECTION: Setup
  const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
    createFixtureForNodeClassStart();
  // !SECTION
  const progressObserver = new ReplaySubject();

  const runFlowParams: RunFlowParams = {
    edges: edges,
    nodeConfigs: nodeConfigs,
    connectors: connectors,
    inputVariableValues: inputVariableValues,
    startNodeId: startNodeId,
    preferStreaming: false,
    progressObserver: progressObserver,
  };

  const runFlowContext = new RunFlowContext(runFlowParams);
  const runGraphContext = runFlowContext.createRunGraphContext(startNodeId);
  const runNodeContext = runGraphContext.createRunNodeContext(startNodeId);

  expect(runNodeContext.outputVariables).toEqual(
    expect.objectContaining([
      expect.objectContaining({ index: 0 }),
      expect.objectContaining({ index: 1 }),
    ]),
  );
  expect(runNodeContext.outputVariables.length).toBe(2);

  expect(runNodeContext.getInputVariableValues()).toEqual([null, 'test 2']);
});

test('RunNodeContext::getInputVariableValues() should handle non-Start node class', () => {
  // SECTION: Setup
  const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
    createFixtureForNodeClassNoneStart();
  // !SECTION
  const progressObserver = new ReplaySubject();

  const runFlowParams: RunFlowParams = {
    edges: edges,
    nodeConfigs: nodeConfigs,
    connectors: connectors,
    inputVariableValues: inputVariableValues,
    startNodeId: startNodeId,
    preferStreaming: false,
    progressObserver: progressObserver,
  };

  const runFlowContext = new RunFlowContext(runFlowParams);
  const runGraphContext = runFlowContext.createRunGraphContext(startNodeId);
  const runNodeContext = runGraphContext.createRunNodeContext(startNodeId);

  expect(runNodeContext.inputVariables).toEqual(
    expect.objectContaining([
      expect.objectContaining({ index: 0 }),
      expect.objectContaining({ index: 1 }),
      expect.objectContaining({ index: 2 }),
      expect.objectContaining({ index: 3 }),
    ]),
  );
  expect(runNodeContext.inputVariables.length).toBe(4);

  expect(runNodeContext.getInputVariableValues()).toEqual([
    'test 1',
    'test 2',
    null,
    null,
  ]);
});

test('RunNodeContext::getParamsForRunNodeFunction()', () => {
  // SECTION: Setup
  const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
    createFixtureForNodeClassNoneStart();
  // !SECTION
  const progressObserver = new ReplaySubject();

  const runFlowParams: RunFlowParams = {
    edges: edges,
    nodeConfigs: nodeConfigs,
    connectors: connectors,
    inputVariableValues: inputVariableValues,
    startNodeId: startNodeId,
    preferStreaming: false,
    progressObserver: progressObserver,
  };

  const runFlowContext = new RunFlowContext(runFlowParams);
  const runGraphContext = runFlowContext.createRunGraphContext(startNodeId);
  const runNodeContext = runGraphContext.createRunNodeContext(startNodeId);

  const runNodeParams: RunNodeParams<TextTemplateNodeAllLevelConfig> =
    runNodeContext.getParamsForRunNodeFunction();

  expect(runNodeParams.nodeConfig).toEqual(
    expect.objectContaining({
      class: 'Process',
      type: 'TextTemplate',
      nodeId: startNodeId,
    }),
  );

  // Input variables
  expect(runNodeParams.inputVariables).toEqual(
    expect.objectContaining([
      expect.objectContaining({ index: 0 }),
      expect.objectContaining({ index: 1 }),
      expect.objectContaining({ index: 2 }),
      expect.objectContaining({ index: 3 }),
    ]),
  );
  expect(runNodeParams.inputVariables.length).toBe(4);

  // Output variables
  expect(runNodeParams.outputVariables).toEqual(
    expect.objectContaining([expect.objectContaining({ index: 0 })]),
  );
  expect(runNodeContext.outputVariables.length).toBe(1);

  // Outgoing conditions
  expect(runNodeParams.outgoingConditions).toEqual(
    expect.objectContaining([expect.objectContaining({ index: 0 })]),
  );
  expect(runNodeParams.outgoingConditions.length).toBe(1);

  // Variable values
  expect(runNodeParams.inputVariableValues).toEqual([
    'test 1',
    'test 2',
    null,
    null,
  ]);
});

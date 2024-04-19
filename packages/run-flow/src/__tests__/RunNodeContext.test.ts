import type { Edge } from 'reactflow';
import { ReplaySubject } from 'rxjs';
import { describe, expect, test } from 'vitest';

import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  RunNodeParams,
  TextTemplateNodeAllLevelConfig,
  VariableValueRecords,
} from 'flow-models';

import RunFlowContext from '../RunFlowContext';
import {
  ConnectorRunState,
  EdgeRunState,
  NodeRunState,
  type RunFlowParams,
} from '../types';
import { createFixtureForNodeClassProcess } from './fixture';

describe('Start node class', () => {
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

  test('RunNodeContext::updateNodeRunStateBaseOnIncomingConnectorStates()', () => {
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

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        PM5i4: 'PENDING',
      },
      connectorStates: {
        'PM5i4/4zxZ6': 'UNCONNECTED',
        'PM5i4/hbg4s': 'UNCONNECTED',
        'PM5i4/sMBfz': 'UNCONNECTED',
      },
      edgeStates: {},
      edgeIdToTargetHandle: expect.anything(),
      sourceHandleToEdgeIds: expect.anything(),
    });

    expect(runNodeContext.nodeRunState).toEqual('PENDING');

    runNodeContext.updateNodeRunStateBaseOnIncomingConnectorStates();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        PM5i4: 'RUNNING',
      },
      connectorStates: {
        'PM5i4/4zxZ6': 'UNCONNECTED',
        'PM5i4/hbg4s': 'UNCONNECTED',
        'PM5i4/sMBfz': 'UNCONNECTED',
      },
      edgeStates: {},
      edgeIdToTargetHandle: expect.anything(),
      sourceHandleToEdgeIds: expect.anything(),
    });

    expect(runNodeContext.nodeRunState).toEqual('RUNNING');
  });

  test('RunNodeContext::getInputVariableValues()', () => {
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

  test('RunNodeContext::updateVariableValues()', () => {
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

    expect(runNodeContext.outputVariableValues).toEqual({});

    runNodeContext.updateVariableValues([null, 'test 2']);

    expect(runNodeContext.outputVariableValues).toEqual({
      'PM5i4/4zxZ6': { value: 'test 2' },
      'PM5i4/hbg4s': { value: null },
    });
  });

  test('RunNodeContext::propagateConnectorResults()', () => {
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

    runNodeContext.outputVariableValues = {
      'PM5i4/hbg4s': { value: 'test 1' },
      'PM5i4/4zxZ6': { value: 'test 2' },
    };
    runNodeContext.outgoingConditionResults = {
      'PM5i4/sMBfz': { isConditionMatched: true },
    };

    runNodeContext.propagateConnectorResults();

    expect(runFlowContext.allVariableValues).toEqual({
      'GTCdE': { value: 'test 1' },
      'PM5i4/4zxZ6': { value: 'test 2' },
    });
    expect(runFlowContext.allConditionResults).toEqual({
      'PM5i4/sMBfz': { isConditionMatched: true },
    });
  });
});

describe('Process node class', () => {
  test('RunNodeContext::propagateRunState() should propagate SUCCEEDED state', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      previousNodeNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: previousNodeNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext =
      runFlowContext.createRunGraphContext(previousNodeNodeId);
    const runNodeContext =
      runGraphContext.createRunNodeContext(previousNodeNodeId);

    runGraphContext.runFlowStates = {
      nodeStates: {
        PM5i4: NodeRunState.SUCCEEDED,
        hstPg: NodeRunState.PENDING,
      },
      connectorStates: {
        'PM5i4/4zxZ6': ConnectorRunState.PENDING,
        'PM5i4/hbg4s': ConnectorRunState.PENDING,
        'PM5i4/sMBfz': ConnectorRunState.PENDING,
        'hstPg/3neA2': ConnectorRunState.UNCONNECTED,
        'hstPg/I3lzc': ConnectorRunState.UNCONNECTED,
        'hstPg/Tw8g0': ConnectorRunState.UNCONNECTED,
        'hstPg/XrU7m': ConnectorRunState.PENDING,
        'hstPg/c4Ts9': ConnectorRunState.UNCONNECTED,
        'hstPg/g3NPR': ConnectorRunState.UNCONNECTED,
        'hstPg/content': ConnectorRunState.UNCONNECTED,
      },
      edgeStates: {
        '84q9B': EdgeRunState.PENDING,
      },
      sourceHandleToEdgeIds: { 'PM5i4/hbg4s': ['84q9B'] },
      edgeIdToTargetHandle: { '84q9B': 'hstPg/XrU7m' },
    };

    runNodeContext.propagateRunState();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        PM5i4: NodeRunState.SUCCEEDED,
        hstPg: NodeRunState.PENDING,
      },
      connectorStates: {
        'PM5i4/4zxZ6': ConnectorRunState.MET,
        'PM5i4/hbg4s': ConnectorRunState.MET,
        'PM5i4/sMBfz': ConnectorRunState.MET,
        'hstPg/3neA2': ConnectorRunState.UNCONNECTED,
        'hstPg/I3lzc': ConnectorRunState.UNCONNECTED,
        'hstPg/Tw8g0': ConnectorRunState.UNCONNECTED,
        'hstPg/XrU7m': ConnectorRunState.MET,
        'hstPg/c4Ts9': ConnectorRunState.UNCONNECTED,
        'hstPg/g3NPR': ConnectorRunState.UNCONNECTED,
        'hstPg/content': ConnectorRunState.UNCONNECTED,
      },
      edgeStates: {
        '84q9B': EdgeRunState.MET,
      },
      sourceHandleToEdgeIds: expect.anything(),
      edgeIdToTargetHandle: expect.anything(),
    });
  });

  test('RunNodeContext::propagateRunState() should propagate FAILED state', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      previousNodeNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: previousNodeNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext =
      runFlowContext.createRunGraphContext(previousNodeNodeId);
    const runNodeContext =
      runGraphContext.createRunNodeContext(previousNodeNodeId);

    runGraphContext.runFlowStates = {
      nodeStates: {
        PM5i4: NodeRunState.FAILED,
        hstPg: NodeRunState.PENDING,
      },
      connectorStates: {
        'PM5i4/4zxZ6': ConnectorRunState.PENDING,
        'PM5i4/hbg4s': ConnectorRunState.PENDING,
        'PM5i4/sMBfz': ConnectorRunState.PENDING,
        'hstPg/3neA2': ConnectorRunState.UNCONNECTED,
        'hstPg/I3lzc': ConnectorRunState.UNCONNECTED,
        'hstPg/Tw8g0': ConnectorRunState.UNCONNECTED,
        'hstPg/XrU7m': ConnectorRunState.PENDING,
        'hstPg/c4Ts9': ConnectorRunState.UNCONNECTED,
        'hstPg/g3NPR': ConnectorRunState.UNCONNECTED,
        'hstPg/content': ConnectorRunState.UNCONNECTED,
      },
      edgeStates: {
        '84q9B': EdgeRunState.PENDING,
      },
      sourceHandleToEdgeIds: { 'PM5i4/hbg4s': ['84q9B'] },
      edgeIdToTargetHandle: { '84q9B': 'hstPg/XrU7m' },
    };

    runNodeContext.propagateRunState();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        PM5i4: NodeRunState.FAILED,
        hstPg: NodeRunState.PENDING,
      },
      connectorStates: {
        'PM5i4/4zxZ6': ConnectorRunState.SKIPPED,
        'PM5i4/hbg4s': ConnectorRunState.SKIPPED,
        'PM5i4/sMBfz': ConnectorRunState.SKIPPED,
        'hstPg/3neA2': ConnectorRunState.UNCONNECTED,
        'hstPg/I3lzc': ConnectorRunState.UNCONNECTED,
        'hstPg/Tw8g0': ConnectorRunState.UNCONNECTED,
        'hstPg/XrU7m': ConnectorRunState.SKIPPED,
        'hstPg/c4Ts9': ConnectorRunState.UNCONNECTED,
        'hstPg/g3NPR': ConnectorRunState.UNCONNECTED,
        'hstPg/content': ConnectorRunState.UNCONNECTED,
      },
      edgeStates: {
        '84q9B': EdgeRunState.SKIPPED,
      },
      sourceHandleToEdgeIds: expect.anything(),
      edgeIdToTargetHandle: expect.anything(),
    });
  });

  test('RunNodeContext::updateNodeRunStateBaseOnIncomingConnectorStates() should transite to RUNNING state', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: currentNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(currentNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(currentNodeId);

    runGraphContext.runFlowStates = {
      nodeStates: {
        PM5i4: NodeRunState.SUCCEEDED,
        hstPg: NodeRunState.PENDING,
      },
      connectorStates: {
        'PM5i4/4zxZ6': ConnectorRunState.MET,
        'PM5i4/hbg4s': ConnectorRunState.MET,
        'PM5i4/sMBfz': ConnectorRunState.MET,
        'hstPg/3neA2': ConnectorRunState.UNCONNECTED,
        'hstPg/I3lzc': ConnectorRunState.UNCONNECTED,
        'hstPg/Tw8g0': ConnectorRunState.UNCONNECTED,
        'hstPg/XrU7m': ConnectorRunState.MET,
        'hstPg/c4Ts9': ConnectorRunState.UNCONNECTED,
        'hstPg/g3NPR': ConnectorRunState.UNCONNECTED,
        'hstPg/content': ConnectorRunState.UNCONNECTED,
      },
      edgeStates: {
        '84q9B': EdgeRunState.MET,
      },
      sourceHandleToEdgeIds: { 'PM5i4/hbg4s': ['84q9B'] },
      edgeIdToTargetHandle: { '84q9B': 'hstPg/XrU7m' },
    };

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.PENDING);

    runNodeContext.updateNodeRunStateBaseOnIncomingConnectorStates();

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.RUNNING);
  });

  test('RunNodeContext::updateNodeRunStateBaseOnIncomingConnectorStates() should transite to SKIPPED state', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: currentNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(currentNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(currentNodeId);

    runGraphContext.runFlowStates = {
      nodeStates: {
        PM5i4: NodeRunState.FAILED,
        hstPg: NodeRunState.PENDING,
      },
      connectorStates: {
        'PM5i4/4zxZ6': ConnectorRunState.SKIPPED,
        'PM5i4/hbg4s': ConnectorRunState.SKIPPED,
        'PM5i4/sMBfz': ConnectorRunState.SKIPPED,
        'hstPg/3neA2': ConnectorRunState.UNCONNECTED,
        'hstPg/I3lzc': ConnectorRunState.UNCONNECTED,
        'hstPg/Tw8g0': ConnectorRunState.UNCONNECTED,
        'hstPg/XrU7m': ConnectorRunState.SKIPPED,
        'hstPg/c4Ts9': ConnectorRunState.UNCONNECTED,
        'hstPg/g3NPR': ConnectorRunState.UNCONNECTED,
        'hstPg/content': ConnectorRunState.UNCONNECTED,
      },
      edgeStates: {
        '84q9B': EdgeRunState.SKIPPED,
      },
      sourceHandleToEdgeIds: { 'PM5i4/hbg4s': ['84q9B'] },
      edgeIdToTargetHandle: { '84q9B': 'hstPg/XrU7m' },
    };

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.PENDING);

    runNodeContext.updateNodeRunStateBaseOnIncomingConnectorStates();

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.SKIPPED);
  });

  test('RunNodeContext::getInputVariableValues()', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION
    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: currentNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(currentNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(currentNodeId);

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
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION
    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: currentNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(currentNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(currentNodeId);

    const runNodeParams: RunNodeParams<TextTemplateNodeAllLevelConfig> =
      runNodeContext.getParamsForRunNodeFunction();

    expect(runNodeParams.nodeConfig).toEqual(
      expect.objectContaining({
        class: 'Process',
        type: 'TextTemplate',
        nodeId: currentNodeId,
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

  test('RunNodeContext::updateOutgoingConditionResultsIfNotConditionNode()', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: currentNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(currentNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(currentNodeId);

    expect(runNodeContext.outgoingConditionResults).toEqual({});

    runNodeContext.updateOutgoingConditionResultsIfNotConditionNode();

    expect(runNodeContext.outgoingConditionResults).toEqual({
      'hstPg/c4Ts9': { isConditionMatched: true },
    });
  });
});

describe('Finish node class', () => {
  function createFixtureForNodeClassFinish() {
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

    const inputVariableValues: VariableValueRecords = {};

    const currentNodeNodeId = '23u6c';

    return {
      edges,
      nodeConfigs,
      connectors,
      inputVariableValues,
      currentNodeNodeId,
    };
  }

  test('RunNodeContext::propagateConnectorResults()', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassFinish();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: currentNodeNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext =
      runFlowContext.createRunGraphContext(currentNodeNodeId);
    const runNodeContext =
      runGraphContext.createRunNodeContext(currentNodeNodeId);

    runNodeContext.outputVariableValues = {
      '23u6c/bxr8O': { value: 'test 1' },
      '23u6c/QWCNF': { value: 'test 2' },
    };

    runNodeContext.propagateConnectorResults();

    expect(runFlowContext.allVariableValues).toEqual({
      '23u6c/bxr8O': { value: 'test 1' },
      '23u6c/QWCNF': { value: 'test 2' },
    });
  });

  test('RunNodeContext::handleFinishNode()', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassFinish();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: currentNodeNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext =
      runFlowContext.createRunGraphContext(currentNodeNodeId);
    const runNodeContext =
      runGraphContext.createRunNodeContext(currentNodeNodeId);

    runNodeContext.handleFinishNode();

    expect(runGraphContext.succeededFinishNodeIds).toEqual(['23u6c']);
    expect(runGraphContext.finishNodesVariableIds).toEqual([
      '23u6c/bxr8O',
      '23u6c/QWCNF',
    ]);
  });
});

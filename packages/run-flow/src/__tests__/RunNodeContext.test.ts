import { ReplaySubject } from 'rxjs';
import { describe, expect, test } from 'vitest';

import type {
  RunNodeParams,
  TextTemplateNodeAllLevelConfig,
} from 'flow-models';

import RunFlowContext from '../RunFlowContext';
import {
  ConnectorRunState,
  EdgeRunState,
  NodeRunState,
  type RunFlowParams,
} from '../types';
import {
  createFixtureForNodeClassFinish,
  createFixtureForNodeClassProcess,
  createFixtureForNodeClassStart,
} from './fixture';

describe('RunNodeContext::updateOutgoingConditionResultsIfNotConditionNode()', () => {
  test('Process node should automatically add set condition to matched', () => {
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

describe('RunNodeContext::getInputVariableValues()', () => {
  test('Start node should not get value from global variables', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassStart();
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

    expect(runNodeContext.outputVariables).toEqual(
      expect.objectContaining([
        expect.objectContaining({ index: 0 }),
        expect.objectContaining({ index: 1 }),
      ]),
    );
    expect(runNodeContext.outputVariables.length).toBe(2);

    expect(runNodeContext.getInputVariableValues()).toEqual([null, 'test 2']);
  });

  test('Process node should respect isGlobal', () => {
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
});

describe('RunNodeContext::propagateConnectorResults()', () => {
  test('Start node should set value to global variable if isGlobal', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassStart();
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

  test('Finish node should not set value to global variable', () => {
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
});

describe('RunNodeContext::updateNodeRunStateBaseOnIncomingConnectorStates()', () => {
  test('Start node should transite to RUNNING state', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassStart();
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

  test('Process node should transite to RUNNING state', () => {
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

  test('Process node should transite to SKIPPED state if incoming connector SKIPPED', () => {
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
});

describe('RunNodeContext::propagateRunState()', () => {
  test('Process node SUCCEEDED should propagate MET state to connectors and edges', () => {
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

  test('Process node FAILED should propagate SKIPPED state to connectors and edges', () => {
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
});

describe('RunNodeContext::updateVariableValues()', () => {
  test('Start node should set variable value', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassStart();
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

    expect(runNodeContext.outputVariableValues).toEqual({});

    runNodeContext.updateVariableValues([null, 'test 2']);

    expect(runNodeContext.outputVariableValues).toEqual({
      'PM5i4/4zxZ6': { value: 'test 2' },
      'PM5i4/hbg4s': { value: null },
    });
  });
});

describe('RunNodeContext::getParamsForRunNodeFunction()', () => {
  test('Process node should work as expected', () => {
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
});

describe('RunNodeContext::handleFinishNode()', () => {
  test('Finish node should save nodeId and variableId', () => {
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

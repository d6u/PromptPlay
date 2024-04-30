import { ReplaySubject } from 'rxjs';
import { describe, expect, test } from 'vitest';

import type {
  RunNodeParams,
  TextTemplateNodeAllLevelConfig,
} from 'flow-models';

import RunFlowContext from '../RunFlowContext';
import { NodeRunState, type RunFlowParams } from '../types';
import {
  createFxitureForTwoIncomingEdgesForOneCondition,
  createStartNode1SKIPPEDStateForTwoIncomingEdgesForOneCondition,
  createStartNode1SUCCEEDEDForTwoIncomingEdgesForOneCondition,
} from './fixture-multiple-incoming-edges-for-one-condition';
import {
  createFixtureForNodeClassFinish,
  createFixtureForNodeClassProcess,
  createFixtureForNormalWithStartProcessFinishNodes,
  createInitialRunStatesForNormalWithStartProcessFinishNodes,
  createStartSKIPPEDStatesForNormalWithStartProcessFinishNodes,
  createStartSUCCEEDEDtatesForNormalWithStartProcessFinishNodes,
} from './fixture-normal-with-start-process-finish';

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
    const { edges, nodeConfigs, connectors, startNodeId } =
      createFixtureForNormalWithStartProcessFinishNodes();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: {
        'bRsjl': { value: 'test global' },
        'Gav0R/eSv7v': { value: 'test 2' },
      },
      startNodeId: startNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(startNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(startNodeId);

    expect(runNodeContext.outputVariables).toEqual(
      expect.objectContaining([
        expect.objectContaining({ id: 'Gav0R/FYiVo' }),
        expect.objectContaining({ id: 'Gav0R/eSv7v' }),
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
        expect.objectContaining({ id: 'hstPg/XrU7m' }),
        expect.objectContaining({ id: 'hstPg/g3NPR' }),
        expect.objectContaining({ id: 'hstPg/Tw8g0' }),
        expect.objectContaining({ id: 'hstPg/I3lzc' }),
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
    const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
      createFixtureForNormalWithStartProcessFinishNodes();
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
      'Gav0R/FYiVo': { value: 'test 1' },
      'Gav0R/eSv7v': { value: 'test 2' },
    };
    runNodeContext.outgoingConditionResults = {
      'PM5i4/sMBfz': { isConditionMatched: true },
    };

    runNodeContext.updateOutgoingConditionResultsIfNotConditionNode();
    runNodeContext.propagateConnectorResults();

    expect(runFlowContext.allVariableValues).toEqual({
      'Gav0R/FYiVo': { value: 'test 1' },
      'bRsjl': { value: 'test 2' },
    });
    expect(runFlowContext.allConditionResults).toEqual({
      'Gav0R/h3hjH': { isConditionMatched: true },
    });
  });

  test('Finish node should not set value to global variable', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassFinish();
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
      '23u6c/bxr8O': { value: 'test 1' },
      '23u6c/QWCNF': { value: 'test 2' },
    };

    runNodeContext.propagateConnectorResults();

    expect(runFlowContext.allVariableValues).toEqual(
      expect.objectContaining({
        '23u6c/bxr8O': { value: 'test 1' },
        '23u6c/QWCNF': { value: 'test 2' },
      }),
    );
  });
});

describe('RunNodeContext::updateNodeRunStateBaseOnIncomingConnectorStates()', () => {
  test('Start node should parse initial run states correctly', () => {
    // SECTION: Setup
    const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
      createFixtureForNormalWithStartProcessFinishNodes();
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

    expect(runGraphContext.runFlowStates).toEqual(
      createInitialRunStatesForNormalWithStartProcessFinishNodes(),
    );
  });

  test('Start node should transite to RUNNING state', () => {
    // SECTION: Setup
    const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
      createFixtureForNormalWithStartProcessFinishNodes();
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

    expect(runNodeContext.nodeRunState).toEqual('PENDING');

    runNodeContext.updateNodeRunStateBaseOnIncomingConnectorStates();

    expect(runNodeContext.nodeRunState).toEqual('RUNNING');
  });

  test('Process node should transite to SKIPPED state if incoming connector SKIPPED', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      processNodeId,
      inputVariableValues,
    } = createFixtureForNormalWithStartProcessFinishNodes();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: processNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(processNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(processNodeId);

    // NOTE: Install mock states
    runGraphContext.runFlowStates =
      createStartSKIPPEDStatesForNormalWithStartProcessFinishNodes();

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.PENDING);

    runNodeContext.updateNodeRunStateBaseOnIncomingConnectorStates();

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.SKIPPED);
  });

  test('Process node should transite to RUNNING state', () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      processNodeId,
      inputVariableValues,
    } = createFixtureForNormalWithStartProcessFinishNodes();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: processNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(processNodeId);
    const runNodeContext = runGraphContext.createRunNodeContext(processNodeId);

    // NOTE: Install mock states
    runGraphContext.runFlowStates =
      createStartSUCCEEDEDtatesForNormalWithStartProcessFinishNodes();

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.PENDING);

    runNodeContext.updateNodeRunStateBaseOnIncomingConnectorStates();

    expect(runNodeContext.nodeRunState).toEqual(NodeRunState.RUNNING);
  });
});

describe('RunNodeContext::propagateRunState()', () => {
  test('Start node SKIPPED should propagate state to connectors and edges', () => {
    // SECTION: Setup
    const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
      createFixtureForNormalWithStartProcessFinishNodes();
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

    runGraphContext.runFlowStates.nodeStates[startNodeId] =
      NodeRunState.SKIPPED;

    expect(runNodeContext.nodeRunState).toEqual('SKIPPED');

    runNodeContext.propagateRunState();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        Gav0R: 'SKIPPED',
        K5n6N: 'PENDING',
        KbeEk: 'PENDING',
      },
      connectorStates: {
        'Gav0R/FYiVo': 'SKIPPED',
        'Gav0R/eSv7v': 'SKIPPED',
        'Gav0R/h3hjH': 'SKIPPED',
        'K5n6N/GYjaT': 'UNCONNECTED',
        'K5n6N/JCG2R': 'UNCONNECTED',
        'K5n6N/Ok8PJ': 'UNCONNECTED',
        'K5n6N/XmH61': 'SKIPPED',
        'K5n6N/hHQNY': 'UNCONNECTED',
        'K5n6N/mPehv': 'PENDING',
        'KbeEk/2xFif': 'PENDING',
        'KbeEk/R6Y7U': 'UNCONNECTED',
        'KbeEk/ktoDr': 'UNCONNECTED',
        'K5n6N/content': 'UNCONNECTED',
      },
      edgeStates: {
        ISUpn: 'SKIPPED',
        pu5e1: 'PENDING',
      },
    });
  });

  test('Start node SUCCEEDED should propagate state to connectors and edges', () => {
    // SECTION: Setup
    const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
      createFixtureForNormalWithStartProcessFinishNodes();
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

    runGraphContext.runFlowStates.nodeStates[startNodeId] =
      NodeRunState.SUCCEEDED;

    expect(runNodeContext.nodeRunState).toEqual('SUCCEEDED');

    runNodeContext.updateOutgoingConditionResultsIfNotConditionNode();
    runNodeContext.propagateRunState();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        Gav0R: 'SUCCEEDED',
        K5n6N: 'PENDING',
        KbeEk: 'PENDING',
      },
      connectorStates: {
        'Gav0R/FYiVo': 'MET',
        'Gav0R/eSv7v': 'MET',
        'Gav0R/h3hjH': 'MET',
        'K5n6N/GYjaT': 'UNCONNECTED',
        'K5n6N/JCG2R': 'UNCONNECTED',
        'K5n6N/Ok8PJ': 'UNCONNECTED',
        'K5n6N/XmH61': 'MET',
        'K5n6N/hHQNY': 'UNCONNECTED',
        'K5n6N/mPehv': 'PENDING',
        'KbeEk/2xFif': 'PENDING',
        'KbeEk/R6Y7U': 'UNCONNECTED',
        'KbeEk/ktoDr': 'UNCONNECTED',
        'K5n6N/content': 'UNCONNECTED',
      },
      edgeStates: {
        ISUpn: 'MET',
        pu5e1: 'PENDING',
      },
    });
  });

  test('Start node FAILED should propagate state to connectors and edges', () => {
    // SECTION: Setup
    const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
      createFixtureForNormalWithStartProcessFinishNodes();
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

    runGraphContext.runFlowStates.nodeStates[startNodeId] = NodeRunState.FAILED;

    expect(runNodeContext.nodeRunState).toEqual('FAILED');

    runNodeContext.propagateRunState();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        Gav0R: 'FAILED',
        K5n6N: 'PENDING',
        KbeEk: 'PENDING',
      },
      connectorStates: {
        'Gav0R/FYiVo': 'SKIPPED',
        'Gav0R/eSv7v': 'SKIPPED',
        'Gav0R/h3hjH': 'SKIPPED',
        'K5n6N/GYjaT': 'UNCONNECTED',
        'K5n6N/JCG2R': 'UNCONNECTED',
        'K5n6N/Ok8PJ': 'UNCONNECTED',
        'K5n6N/XmH61': 'SKIPPED',
        'K5n6N/hHQNY': 'UNCONNECTED',
        'K5n6N/mPehv': 'PENDING',
        'KbeEk/2xFif': 'PENDING',
        'KbeEk/R6Y7U': 'UNCONNECTED',
        'KbeEk/ktoDr': 'UNCONNECTED',
        'K5n6N/content': 'UNCONNECTED',
      },
      edgeStates: {
        ISUpn: 'SKIPPED',
        pu5e1: 'PENDING',
      },
    });
  });

  test("One ancestor node propagate SUCCEEDED should should win against another ancestor's SKIPPED", () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      startNodeId1,
      startNodeId2,
      inputVariableValues,
    } = createFxitureForTwoIncomingEdgesForOneCondition();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: startNodeId2,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(startNodeId2);
    const runNodeContext = runGraphContext.createRunNodeContext(startNodeId2);

    // NOTE: Install mock states
    runGraphContext.runFlowStates =
      createStartNode1SKIPPEDStateForTwoIncomingEdgesForOneCondition();
    runGraphContext.runFlowStates.nodeStates[startNodeId2] =
      NodeRunState.SUCCEEDED;

    runNodeContext.updateOutgoingConditionResultsIfNotConditionNode();
    runNodeContext.propagateRunState();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        '8jIMr': 'SKIPPED',
        'jswKV': 'SUCCEEDED',
        'coZ0B': 'PENDING',
      },
      connectorStates: {
        '8jIMr/PEHuV': 'SKIPPED',
        'coZ0B/EV4kO': 'UNCONNECTED',
        'coZ0B/WQ6WM': 'MET',
        'jswKV/yN6kp': 'MET',
        'coZ0B/content': 'UNCONNECTED',
      },
      edgeStates: {
        ufmj3: 'MET',
        p8tGn: 'SKIPPED',
      },
    });
  });

  test("One ancestor node propagate SKIPPED should should not win against another ancestor's SUCCEEDED", () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      startNodeId2,
      inputVariableValues,
    } = createFxitureForTwoIncomingEdgesForOneCondition();
    // !SECTION

    const progressObserver = new ReplaySubject();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: inputVariableValues,
      startNodeId: startNodeId2,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(startNodeId2);
    const runNodeContext = runGraphContext.createRunNodeContext(startNodeId2);

    // NOTE: Install mock states
    runGraphContext.runFlowStates =
      createStartNode1SUCCEEDEDForTwoIncomingEdgesForOneCondition();
    runGraphContext.runFlowStates.nodeStates[startNodeId2] =
      NodeRunState.SKIPPED;

    runNodeContext.propagateRunState();

    expect(runGraphContext.runFlowStates).toEqual({
      nodeStates: {
        '8jIMr': 'SUCCEEDED',
        'jswKV': 'SKIPPED',
        'coZ0B': 'PENDING',
      },
      connectorStates: {
        '8jIMr/PEHuV': 'MET',
        'coZ0B/EV4kO': 'UNCONNECTED',
        'coZ0B/WQ6WM': 'MET',
        'jswKV/yN6kp': 'SKIPPED',
        'coZ0B/content': 'UNCONNECTED',
      },
      edgeStates: {
        ufmj3: 'SKIPPED',
        p8tGn: 'MET',
      },
    });
  });
});

describe('RunNodeContext::updateVariableValues()', () => {
  test('Start node should set variable value', () => {
    // SECTION: Setup
    const { edges, nodeConfigs, connectors, startNodeId, inputVariableValues } =
      createFixtureForNormalWithStartProcessFinishNodes();
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
      'Gav0R/FYiVo': { value: null },
      'Gav0R/eSv7v': { value: 'test 2' },
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
        kind: 'Process',
        type: 'TextTemplate',
        nodeId: currentNodeId,
      }),
    );

    // Input variables
    expect(runNodeParams.inputVariables).toEqual(
      expect.objectContaining([
        expect.objectContaining({ id: 'hstPg/XrU7m' }),
        expect.objectContaining({ id: 'hstPg/g3NPR' }),
        expect.objectContaining({ id: 'hstPg/Tw8g0' }),
        expect.objectContaining({ id: 'hstPg/I3lzc' }),
      ]),
    );
    expect(runNodeParams.inputVariables.length).toBe(4);

    // Output variables
    expect(runNodeParams.outputVariables).toEqual(
      expect.objectContaining([
        expect.objectContaining({ id: 'hstPg/content' }),
      ]),
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
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassFinish();
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

    runNodeContext.handleFinishNode();

    expect(runGraphContext.succeededFinishNodeIds).toEqual(['23u6c']);
    expect(runGraphContext.finishNodesVariableIds).toEqual([
      '23u6c/bxr8O',
      '23u6c/QWCNF',
    ]);
  });
});

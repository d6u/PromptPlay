import type { Edge } from 'reactflow';
import { ReplaySubject, lastValueFrom, tap, throwError } from 'rxjs';
import { describe, expect, test } from 'vitest';

import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  VariableValueRecords,
} from 'flow-models';

import RunFlowContext from '../RunFlowContext';
import type { RunNodeProgressEvent } from '../event-types';
import { runNode } from '../runFlow';
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

    const currentNodeId = 'PM5i4';

    return {
      edges,
      nodeConfigs,
      connectors,
      inputVariableValues,
      currentNodeId,
    };
  }

  test('runNode should run successfully', () => {
    return new Promise<void>((resolve, reject) => {
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
      const runGraphContext =
        runFlowContext.createRunGraphContext(currentNodeId);
      const runNodeContext =
        runGraphContext.createRunNodeContext(currentNodeId);

      expect(runGraphContext.runFlowStates).toEqual({
        nodeStates: { PM5i4: 'PENDING' },
        connectorStates: {
          'PM5i4/4zxZ6': 'UNCONNECTED',
          'PM5i4/hbg4s': 'UNCONNECTED',
          'PM5i4/sMBfz': 'UNCONNECTED',
        },
        edgeStates: {},
        sourceHandleToEdgeIds: expect.anything(),
        edgeIdToTargetHandle: expect.anything(),
      });

      runNode(runNodeContext)
        .pipe(
          tap(() => {
            // Asset in tab so the AssertionError can be caught by reject
            expect.unreachable('Should not emit event');
          }),
        )
        .subscribe({
          error(err) {
            reject(err);
          },
          complete() {
            expect(runGraphContext.runFlowStates).toEqual({
              nodeStates: { PM5i4: 'SUCCEEDED' },
              connectorStates: {
                'PM5i4/4zxZ6': 'MET',
                'PM5i4/hbg4s': 'MET',
                'PM5i4/sMBfz': 'MET',
              },
              edgeStates: {},
              sourceHandleToEdgeIds: expect.anything(),
              edgeIdToTargetHandle: expect.anything(),
            });

            resolve();
          },
        });
    });
  });
});

describe('Process node class', () => {
  test('runNode should run propagate run state in case of SUCCESS', () => {
    return new Promise<void>((resolve, reject) => {
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
      const runGraphContext =
        runFlowContext.createRunGraphContext(currentNodeId);
      const runNodeContext =
        runGraphContext.createRunNodeContext(currentNodeId);

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

      runNode(runNodeContext)
        .pipe(
          // Asset in tab so the AssertionError can be caught by reject
          tap({
            next() {
              expect.unreachable('Should not emit event');
            },
            complete() {
              expect(runGraphContext.runFlowStates).toEqual({
                nodeStates: {
                  PM5i4: 'SUCCEEDED',
                  hstPg: 'SUCCEEDED',
                },
                connectorStates: {
                  'PM5i4/4zxZ6': 'MET',
                  'PM5i4/hbg4s': 'MET',
                  'PM5i4/sMBfz': 'MET',
                  'hstPg/3neA2': 'UNCONNECTED',
                  'hstPg/I3lzc': 'UNCONNECTED',
                  'hstPg/Tw8g0': 'UNCONNECTED',
                  'hstPg/XrU7m': 'MET',
                  'hstPg/c4Ts9': 'MET',
                  'hstPg/g3NPR': 'UNCONNECTED',
                  'hstPg/content': 'MET',
                },
                edgeStates: {
                  '84q9B': 'MET',
                },
                sourceHandleToEdgeIds: expect.anything(),
                edgeIdToTargetHandle: expect.anything(),
              });
            },
          }),
        )
        .subscribe({
          error(err) {
            reject(err);
          },
          complete() {
            resolve();
          },
        });
    });
  });

  test('runNode should run propagate run state in case of FAILED', () => {
    return new Promise<void>((resolve, reject) => {
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
      const runGraphContext =
        runFlowContext.createRunGraphContext(currentNodeId);
      const runNodeContext =
        runGraphContext.createRunNodeContext(currentNodeId);

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

      runNodeContext.runNodeFunc = () => {
        return throwError(() => new Error('Test error'));
      };

      runNode(runNodeContext)
        .pipe(
          // Asset in tab so the AssertionError can be caught by reject
          tap({
            next() {
              expect.unreachable('Should not emit event');
            },
            complete() {
              expect(runGraphContext.runFlowStates).toEqual({
                nodeStates: {
                  PM5i4: 'SUCCEEDED',
                  hstPg: 'FAILED',
                },
                connectorStates: {
                  'PM5i4/4zxZ6': 'MET',
                  'PM5i4/hbg4s': 'MET',
                  'PM5i4/sMBfz': 'MET',
                  'hstPg/3neA2': 'UNCONNECTED',
                  'hstPg/I3lzc': 'UNCONNECTED',
                  'hstPg/Tw8g0': 'UNCONNECTED',
                  'hstPg/XrU7m': 'MET',
                  'hstPg/g3NPR': 'UNCONNECTED',
                  'hstPg/c4Ts9': 'SKIPPED',
                  'hstPg/content': 'SKIPPED',
                },
                edgeStates: {
                  '84q9B': 'MET',
                },
                sourceHandleToEdgeIds: expect.anything(),
                edgeIdToTargetHandle: expect.anything(),
              });
            },
          }),
        )
        .subscribe({
          error(err) {
            reject(err);
          },
          complete() {
            resolve();
          },
        });
    });
  });

  test('runNode should run emit event to progressObserver (runNode succeeded)', async () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION

    const progressObserver = new ReplaySubject<RunNodeProgressEvent>();

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

    let events: RunNodeProgressEvent[] = [];

    progressObserver.subscribe((event) => events.push(event));

    const value = await lastValueFrom(runNode(runNodeContext), {
      defaultValue: 'NO_VALUE',
    });
    expect(value).toBe('NO_VALUE');

    expect(events).toEqual([
      { type: 'Started', nodeId: 'hstPg' },
      {
        type: 'Updated',
        nodeId: 'hstPg',
        result: {
          variableValues: [''],
          completedConnectorIds: ['hstPg/content'],
          variableResults: {
            'hstPg/content': { value: '' },
          },
        },
      },
      { type: 'Finished', nodeId: 'hstPg' },
    ]);
  });

  test('runNode should run emit event to progressObserver (runNode throwed error)', async () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassProcess();
    // !SECTION

    const progressObserver = new ReplaySubject<RunNodeProgressEvent>();

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

    runNodeContext.runNodeFunc = () => {
      return throwError(() => new Error('Test error'));
    };

    let events: RunNodeProgressEvent[] = [];

    progressObserver.subscribe((event) => events.push(event));

    const value = await lastValueFrom(runNode(runNodeContext), {
      defaultValue: 'NO_VALUE',
    });
    expect(value).toBe('NO_VALUE');

    expect(events).toEqual([
      { type: 'Started', nodeId: 'hstPg' },
      { type: 'Finished', nodeId: 'hstPg' },
    ]);
  });
});

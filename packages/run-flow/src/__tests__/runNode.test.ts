import {
  ReplaySubject,
  concat,
  lastValueFrom,
  of,
  tap,
  throwError,
} from 'rxjs';
import { describe, expect, test } from 'vitest';

import RunFlowContext from '../RunFlowContext';
import type { RunNodeProgressEvent } from '../event-types';
import { runNode } from '../runFlow';
import {
  ConnectorRunState,
  EdgeRunState,
  NodeRunState,
  type RunFlowParams,
} from '../types';
import {
  createFixtureForNodeClassFinish,
  createFixtureForNodeClassProcess,
  createFixtureForNormalWithStartProcessFinishNodes,
  createStartSUCCEEDEDtatesForNormalWithStartProcessFinishNodes,
} from './fixture-normal-with-start-process-finish';

describe('Start node class', () => {
  test('runNode should run successfully', () => {
    return new Promise<void>((resolve, reject) => {
      // SECTION: Setup
      const {
        edges,
        nodeConfigs,
        connectors,
        startNodeId,
        inputVariableValues,
      } = createFixtureForNormalWithStartProcessFinishNodes();
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

      runNode(runNodeContext)
        .pipe(
          // Asset in tab so the AssertionError can be caught by reject
          tap({
            next() {
              expect.unreachable('Should not emit event');
            },
            complete() {
              expect(runGraphContext.runFlowStates).toEqual(
                createStartSUCCEEDEDtatesForNormalWithStartProcessFinishNodes(),
              );
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
});

describe('Process node class', () => {
  test('runNode should run propagate run state in case of SKIPPED', () => {
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
          PM5i4: NodeRunState.SKIPPED,
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
                  PM5i4: 'SKIPPED',
                  hstPg: 'SKIPPED',
                },
                connectorStates: {
                  'PM5i4/4zxZ6': 'SKIPPED',
                  'PM5i4/hbg4s': 'SKIPPED',
                  'PM5i4/sMBfz': 'SKIPPED',
                  'hstPg/3neA2': 'UNCONNECTED',
                  'hstPg/I3lzc': 'UNCONNECTED',
                  'hstPg/Tw8g0': 'UNCONNECTED',
                  'hstPg/XrU7m': 'SKIPPED',
                  'hstPg/c4Ts9': 'SKIPPED',
                  'hstPg/g3NPR': 'UNCONNECTED',
                  'hstPg/content': 'SKIPPED',
                },
                edgeStates: {
                  '84q9B': 'SKIPPED',
                },
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

  test('runNode should emit event to progressObserver (runNode succeeded)', async () => {
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
    };

    let events: RunNodeProgressEvent[] = [];

    progressObserver.subscribe((event) => events.push(event));

    const value = await lastValueFrom(runNode(runNodeContext), {
      defaultValue: 'NO_VALUE',
    });
    expect(value).toBe('NO_VALUE');

    expect(events).toEqual([
      { type: 'Started', nodeId: 'hstPg', runFlowStates: expect.anything() },
      {
        type: 'Updated',
        nodeId: 'hstPg',
        result: {
          errors: [],
          variableValues: {
            'hstPg/content': { value: '' },
          },
          conditionResults: {
            'hstPg/c4Ts9': { isConditionMatched: true },
          },
        },
      },
      { type: 'Finished', nodeId: 'hstPg', runFlowStates: expect.anything() },
    ]);
  });

  test('runNode should emit event (with errors) to progressObserver (runNode succeeded)', async () => {
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

    runNodeContext.runNodeFunc = () => {
      return of({
        errors: ['Test warning 1'],
      });
    };

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
    };

    let events: RunNodeProgressEvent[] = [];

    progressObserver.subscribe((event) => events.push(event));

    const value = await lastValueFrom(runNode(runNodeContext), {
      defaultValue: 'NO_VALUE',
    });
    expect(value).toBe('NO_VALUE');

    expect(events).toEqual([
      { type: 'Started', nodeId: 'hstPg', runFlowStates: expect.anything() },
      {
        type: 'Updated',
        nodeId: 'hstPg',
        result: {
          errors: ['Test warning 1'],
          variableValues: {},
          conditionResults: {
            'hstPg/c4Ts9': { isConditionMatched: true },
          },
        },
      },
      { type: 'Finished', nodeId: 'hstPg', runFlowStates: expect.anything() },
    ]);
  });

  test('runNode should emit event to progressObserver (runNode throwed error)', async () => {
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
      { type: 'Started', nodeId: 'hstPg', runFlowStates: expect.anything() },
      {
        type: 'Updated',
        nodeId: 'hstPg',
        result: {
          errors: ['Test error'],
          conditionResults: {},
          variableValues: {},
        },
      },
      { type: 'Finished', nodeId: 'hstPg', runFlowStates: expect.anything() },
    ]);
  });

  test('runNode should emit event (non-fatal errors with fatal error) to progressObserver (runNode throwed error)', async () => {
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
    };

    runNodeContext.runNodeFunc = () => {
      return concat(
        of({ errors: ['Test warning 1'] }),
        throwError(() => new Error('Test error')),
      );
    };

    let events: RunNodeProgressEvent[] = [];

    progressObserver.subscribe((event) => events.push(event));

    const value = await lastValueFrom(runNode(runNodeContext), {
      defaultValue: 'NO_VALUE',
    });
    expect(value).toBe('NO_VALUE');

    expect(events).toEqual([
      { type: 'Started', nodeId: 'hstPg', runFlowStates: expect.anything() },
      {
        type: 'Updated',
        nodeId: 'hstPg',
        result: {
          errors: ['Test warning 1'],
          conditionResults: {},
          variableValues: {},
        },
      },
      {
        type: 'Updated',
        nodeId: 'hstPg',
        result: {
          errors: ['Test error', 'Test warning 1'],
          conditionResults: {},
          variableValues: {},
        },
      },
      { type: 'Finished', nodeId: 'hstPg', runFlowStates: expect.anything() },
    ]);
  });
});

describe('Finish node class', () => {
  test('runNode should save nodeIds and variableIds (runNode succeeded)', () => {
    return new Promise<void>((resolve, reject) => {
      // SECTION: Setup
      const {
        edges,
        nodeConfigs,
        connectors,
        currentNodeId,
        inputVariableValues,
      } = createFixtureForNodeClassFinish();
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
      const runGraphContext =
        runFlowContext.createRunGraphContext(currentNodeId);
      const runNodeContext =
        runGraphContext.createRunNodeContext(currentNodeId);

      runNode(runNodeContext)
        .pipe(
          tap({
            complete() {
              expect(runGraphContext.succeededFinishNodeIds).toEqual(['23u6c']);
              expect(runGraphContext.finishNodesVariableIds).toEqual([
                '23u6c/bxr8O',
                '23u6c/QWCNF',
              ]);
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

  test('runNode should not save nodeIds and variableIds (runNode throwed error)', () => {
    return new Promise<void>((resolve, reject) => {
      // SECTION: Setup
      const {
        edges,
        nodeConfigs,
        connectors,
        currentNodeId,
        inputVariableValues,
      } = createFixtureForNodeClassFinish();
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
      const runGraphContext =
        runFlowContext.createRunGraphContext(currentNodeId);
      const runNodeContext =
        runGraphContext.createRunNodeContext(currentNodeId);

      runNodeContext.runNodeFunc = () => {
        return throwError(() => new Error('Test error'));
      };

      runNode(runNodeContext)
        .pipe(
          tap({
            complete() {
              expect(runGraphContext.succeededFinishNodeIds).toEqual([]);
              expect(runGraphContext.finishNodesVariableIds).toEqual([]);
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

  test('runNode should emit event to progressObserver (runNode succeeded)', async () => {
    // SECTION: Setup
    const {
      edges,
      nodeConfigs,
      connectors,
      currentNodeId,
      inputVariableValues,
    } = createFixtureForNodeClassFinish();
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

    let events: RunNodeProgressEvent[] = [];

    progressObserver.subscribe((event) => events.push(event));

    const value = await lastValueFrom(runNode(runNodeContext), {
      defaultValue: 'NO_VALUE',
    });
    expect(value).toBe('NO_VALUE');

    expect(events).toEqual([
      {
        type: 'Started',
        nodeId: currentNodeId,
        runFlowStates: expect.anything(),
      },
      {
        type: 'Updated',
        nodeId: currentNodeId,
        result: {
          errors: [],
          variableValues: {
            '23u6c/QWCNF': { value: 'test 2' },
            '23u6c/bxr8O': { value: null },
          },
          conditionResults: {},
        },
      },
      {
        type: 'Finished',
        nodeId: currentNodeId,
        runFlowStates: expect.anything(),
      },
    ]);
  });
});

import { ReplaySubject, lastValueFrom, tap } from 'rxjs';
import { expect, test } from 'vitest';
import type { RunNodeProgressEvent } from '../event-types';
import runFlow from '../runFlow';
import type { RunFlowParams } from '../types';
import { createFixtureForNormalWithStartProcessFinishNodes } from './fixture-normal-with-start-process-finish';

test('runFlow should emit result', async () => {
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
      'Gav0R/FYiVo': { value: 'test 1' },
      'Gav0R/eSv7v': { value: 'test 2' },
    },
    startNodeId: startNodeId,
    preferStreaming: false,
    progressObserver: progressObserver,
  };

  const result = await lastValueFrom(runFlow(runFlowParams));

  expect(result).toEqual({
    errors: [],
    variableValues: {
      'KbeEk/ktoDr': { value: null },
      'KbeEk/R6Y7U': { value: 'test 2' },
    },
  });
});

test('runFlow should complete progressObservable', () => {
  return new Promise<void>((resolve, reject) => {
    // SECTION: Setup
    const { edges, nodeConfigs, connectors, startNodeId } =
      createFixtureForNormalWithStartProcessFinishNodes();
    // !SECTION

    const progressObserver = new ReplaySubject<RunNodeProgressEvent>();

    const runFlowParams: RunFlowParams = {
      edges: edges,
      nodeConfigs: nodeConfigs,
      connectors: connectors,
      inputVariableValues: {
        'Gav0R/FYiVo': { value: 'test 1' },
        'Gav0R/eSv7v': { value: 'test 2' },
      },
      startNodeId: startNodeId,
      preferStreaming: false,
      progressObserver: progressObserver,
    };

    let events: RunNodeProgressEvent[] = [];
    let isProgressObserverCompleted = false;

    progressObserver.subscribe({
      next(event) {
        events.push(event);
      },
      complete() {
        isProgressObserverCompleted = true;
      },
    });

    runFlow(runFlowParams)
      .pipe(
        // Asset in tab so the AssertionError can be caught by reject
        tap({
          complete() {
            expect(isProgressObserverCompleted).toBe(true);

            expect(events).toEqual([
              // Gav0R
              {
                nodeId: 'Gav0R',
                type: 'Started',
                runFlowStates: expect.anything(),
              },
              {
                nodeId: 'Gav0R',
                type: 'Updated',
                result: {
                  conditionResults: {
                    'Gav0R/h3hjH': { isConditionMatched: true },
                  },
                  errors: [],
                  variableValues: {
                    'Gav0R/FYiVo': { value: 'test 1' },
                    'Gav0R/eSv7v': { value: 'test 2' },
                  },
                },
              },
              {
                nodeId: 'Gav0R',
                type: 'Finished',
                runFlowStates: expect.anything(),
              },
              // K5n6N
              {
                nodeId: 'K5n6N',
                type: 'Started',
                runFlowStates: expect.anything(),
              },
              {
                nodeId: 'K5n6N',
                type: 'Updated',
                result: {
                  conditionResults: {
                    'K5n6N/mPehv': { isConditionMatched: true },
                  },
                  errors: [],
                  variableValues: {
                    'K5n6N/content': { value: '' },
                  },
                },
              },
              {
                nodeId: 'K5n6N',
                type: 'Finished',
                runFlowStates: expect.anything(),
              },
              // KbeEk
              {
                nodeId: 'KbeEk',
                type: 'Started',
                runFlowStates: expect.anything(),
              },
              {
                nodeId: 'KbeEk',
                type: 'Updated',
                result: {
                  conditionResults: {},
                  errors: [],
                  variableValues: {
                    'KbeEk/R6Y7U': { value: 'test 2' },
                    'KbeEk/ktoDr': { value: null },
                  },
                },
              },
              {
                nodeId: 'KbeEk',
                type: 'Finished',
                runFlowStates: expect.anything(),
              },
            ]);
          },
        }),
      )
      .subscribe({ error: reject, complete: resolve });
  });
});

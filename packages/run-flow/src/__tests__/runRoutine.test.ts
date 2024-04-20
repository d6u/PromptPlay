import { ReplaySubject, tap } from 'rxjs';
import { expect, test } from 'vitest';

import RunFlowContext from '../RunFlowContext';
import { runRoutine } from '../runFlow';
import { type RunFlowParams } from '../types';
import {
  createAllSUCCEEDEDStatesForNormalWithStartProcessFinishNodes,
  createFixtureForNormalWithStartProcessFinishNodes,
} from './fixture-normal-with-start-process-finish';

test('runRoutine should run successfully for all nodes', () => {
  return new Promise<void>((resolve, reject) => {
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

    runRoutine(runGraphContext)
      .pipe(
        // Asset in tab so the AssertionError can be caught by reject
        tap({
          next() {
            expect.unreachable('Should not emit event');
          },
          complete() {
            expect(runGraphContext.runFlowStates).toEqual(
              createAllSUCCEEDEDStatesForNormalWithStartProcessFinishNodes(),
            );

            expect(runGraphContext.didAnyFinishNodeSucceeded()).toBe(true);
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

test('runRoutine should provide run result', () => {
  return new Promise<void>((resolve, reject) => {
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

    const runFlowContext = new RunFlowContext(runFlowParams);
    const runGraphContext = runFlowContext.createRunGraphContext(startNodeId);

    runRoutine(runGraphContext)
      .pipe(
        // Asset in tab so the AssertionError can be caught by reject
        tap({
          next() {
            expect.unreachable('Should not emit event');
          },
          complete() {
            expect(runGraphContext.getResult()).toEqual({
              errors: [],
              variableValues: {
                'KbeEk/ktoDr': { value: null },
                'KbeEk/R6Y7U': { value: 'test 2' },
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

import { mergeDeep } from '@dhmk/utils';
import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';
import { BaseEvent } from '../event-graph-util';
import { handleAddNode } from '../handle-add-node';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleAddNode

test('handleAddNode should add node and nodeConfig', () => {
  const prevState = mergeDeep(MOCK_STATE, {});

  const nextState = produce(prevState, (draft) => {
    handleAddNode(draft, {
      type: ChangeEventType.ADDING_NODE,
      node: {
        id: 'yv1vr',
        type: 'InputNode',
        position: {
          x: 510,
          y: 200,
        },
        data: null,
      },
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      nodes: [
        {
          id: 'yv1vr',
          type: 'InputNode',
          position: {
            x: 510,
            y: 200,
          },
          data: null,
          dragHandle: '.node-drag-handle',
        },
      ],
      edges: [],
      nodeConfigsDict: {
        yv1vr: {
          nodeId: 'yv1vr',
          type: 'InputNode',
        },
      },
      variablesDict: expect.anything(),
      variableValueLookUpDicts: expect.anything(),
      nodeExecutionStates: expect.anything(),
    },
  });

  expect(Object.values(nextState.flowContent.variablesDict)).toEqual([
    {
      type: 'FlowInput',
      id: expect.any(String),
      nodeId: 'yv1vr',
      index: 0,
      name: expect.any(String),
      valueType: 'String',
    },
  ]);

  expect(
    Object.values(nextState.flowContent.variableValueLookUpDicts[0]),
  ).toEqual([null]);
});

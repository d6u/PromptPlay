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
      nodeType: 'InputNode',
      x: 510,
      y: 200,
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      nodes: [
        {
          id: expect.any(String),
          type: 'CANVAS_NODE',
          position: {
            x: 510,
            y: 200,
          },
          dragHandle: '.node-drag-handle',
        },
      ],
      edges: [],
      nodeConfigsDict: expect.anything(),
      variablesDict: expect.anything(),
      variableValueLookUpDicts: expect.anything(),
      nodeExecutionStates: expect.anything(),
      nodeAccountLevelFieldsValidationErrors: expect.anything(),
      globalVariables: {},
    },
  });

  expect(Object.values(nextState.flowContent.nodeConfigsDict)).toEqual([
    {
      nodeId: expect.any(String),
      type: 'InputNode',
    },
  ]);

  expect(Object.values(nextState.flowContent.variablesDict)).toEqual([
    {
      type: 'NodeOutput',
      id: expect.any(String),
      nodeId: expect.any(String),
      index: 0,
      name: expect.any(String),
      valueType: 'String',
      isGlobal: true,
      globalVariableId: null,
    },
    {
      type: 'Condition',
      id: expect.any(String),
      index: 0,
      nodeId: expect.any(String),
      expressionString: '',
    },
  ]);

  expect(
    Object.values(nextState.flowContent.variableValueLookUpDicts[0]),
  ).toEqual([null]);
});

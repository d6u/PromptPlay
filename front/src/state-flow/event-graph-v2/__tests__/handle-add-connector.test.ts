import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';
import { BaseEvent, State } from '../event-graph-util';
import { handleAddConnector } from '../handle-add-connector';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleAddConnector

test('handleAddConnector should variable', () => {
  const prevState: State = {
    ...MOCK_STATE,
    nodes: [
      {
        id: 'Z6dPf',
        type: 'InputNode',
        position: {
          x: 328,
          y: 135,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
      },
    ],
    edges: [],
    nodeConfigsDict: {
      Z6dPf: {
        nodeId: 'Z6dPf',
        type: 'InputNode',
      },
    },
    variablesDict: {
      'Z6dPf/wZf7M': {
        type: 'FlowInput',
        id: 'Z6dPf/wZf7M',
        nodeId: 'Z6dPf',
        index: 0,
        name: 'var1',
        valueType: 'String',
      },
    },
    variableValueLookUpDicts: [
      {
        'Z6dPf/wZf7M': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleAddConnector(draft, {
      type: ChangeEventType.ADDING_VARIABLE,
      nodeId: 'Z6dPf',
      connectorType: 'FlowInput',
      connectorIndex: 1,
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    variablesDict: expect.anything(),
    variableValueLookUpDicts: expect.anything(),
  });

  expect(Object.values(nextState.variablesDict)).toEqual([
    {
      type: 'FlowInput',
      id: 'Z6dPf/wZf7M',
      nodeId: 'Z6dPf',
      index: 0,
      name: 'var1',
      valueType: 'String',
    },
    {
      id: expect.any(String),
      nodeId: 'Z6dPf',
      index: 1,
      name: expect.any(String),
      type: 'FlowInput',
      valueType: 'String',
    },
  ]);

  expect(Object.values(nextState.variableValueLookUpDicts[0])).toEqual([
    null,
    null,
  ]);
});

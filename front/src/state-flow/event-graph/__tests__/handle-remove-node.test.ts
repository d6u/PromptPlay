import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { BaseEvent, State } from '../event-graph-util';
import { handleRemoveNode } from '../handle-remove-node';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleRemoveNode

test('handleRemoveNode should remove node, nodeConfig, and connectors', () => {
  const prevState: State = {
    ...MOCK_STATE,
    nodes: [
      {
        id: '8e2At',
        type: 'InputNode',
        position: {
          x: 510,
          y: 200,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
      },
    ],
    edges: [],
    nodeConfigsDict: {
      '8e2At': {
        nodeId: '8e2At',
        type: 'InputNode',
      },
    },
    variablesDict: {
      '8e2At/hqpZx': {
        type: 'FlowInput',
        id: '8e2At/hqpZx',
        nodeId: '8e2At',
        index: 0,
        name: 'kazuwuv',
        valueType: 'String',
      },
    },
    variableValueLookUpDicts: [
      {
        '8e2At/hqpZx': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleRemoveNode(draft, {
      type: ChangeEventType.REMOVING_NODE,
      nodeId: '8e2At',
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    nodes: [],
    edges: [],
    nodeConfigsDict: {},
    variablesDict: {},
    variableValueLookUpDicts: [{}],
  });
});

import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleRemoveNode } from '../handle-remove-node';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleRemoveNode

test('handleRemoveNode should remove node, nodeConfig, and connectors', () => {
  const prevState: State = {
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: '8e2At',
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        '8e2At': {
          class: 'Start',
          type: 'InputNode',
          nodeId: '8e2At',
          nodeName: 'input1',
        },
      },
      connectors: {
        '8e2At/hqpZx': {
          type: 'NodeOutput',
          id: '8e2At/hqpZx',
          nodeId: '8e2At',
          index: 0,
          name: 'kazuwuv',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        '8e2At/hqpZx': { value: null },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleRemoveNode(draft, {
      type: ChangeEventType.REMOVING_NODE,
      nodeId: '8e2At',
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      nodes: [],
      edges: [],
      nodeConfigs: {},
      connectors: {},
      globalVariables: {},
      conditionResults: {},
      variableResults: {},
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
    },
  });
});

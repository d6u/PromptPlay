import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleAddConnector } from '../handle-add-connector';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleAddConnector

test('handleAddConnector should add variable', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'Z6dPf',
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        Z6dPf: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'Z6dPf',
          nodeName: 'input1',
          inputVariableIds: [],
          outputVariableIds: [],
        },
      },
      connectors: {
        'Z6dPf/wZf7M': {
          type: 'NodeOutput',
          id: 'Z6dPf/wZf7M',
          nodeId: 'Z6dPf',
          name: 'var1',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'Z6dPf/wZf7M': { value: null },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleAddConnector(draft, {
      type: ChangeEventType.ADDING_VARIABLE,
      nodeId: 'Z6dPf',
      connectorType: 'NodeOutput',
      connectorIndex: 1,
      variableValueType: 'String',
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      connectors: expect.anything(),
      conditionResults: expect.anything(),
      variableResults: expect.anything(),
    },
  });

  expect(Object.values(nextState.flowContent.connectors)).toEqual([
    {
      type: 'NodeOutput',
      id: 'Z6dPf/wZf7M',
      nodeId: 'Z6dPf',
      name: 'var1',
      valueType: 'String',
      isGlobal: false,
      globalVariableId: null,
    },
    {
      type: 'NodeOutput',
      id: expect.any(String),
      nodeId: 'Z6dPf',
      name: expect.any(String),
      valueType: 'String',
      isGlobal: true,
      globalVariableId: null,
    },
  ]);

  expect(Object.values(nextState.flowContent.variableResults)).toEqual([
    { value: null },
    { value: null },
  ]);
});

import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleUpdateConnectors } from '../handle-update-connectors';
import { MOCK_STATE } from './fixture';

test('handleUpdateConnectors should rename variable', () => {
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
          type: 'InputNode',
          kind: 'Start',
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
    handleUpdateConnectors(draft, {
      type: ChangeEventType.UPDATE_CONNECTORS,
      updates: [
        {
          variableId: 'Z6dPf/wZf7M',
          change: {
            name: 'var2',
          },
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      connectors: {
        'Z6dPf/wZf7M': {
          type: 'NodeOutput',
          id: 'Z6dPf/wZf7M',
          nodeId: 'Z6dPf',
          name: 'var2',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
    },
  });
});

test('handleUpdateConnectors should remove edge when isGlobal become true', () => {
  const prevState: State = {
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'opVRl',
          type: 'CANVAS_NODE',
          position: {
            x: 327.59341772151896,
            y: 1.9002531645569718,
          },
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 137,
          data: null,
        },
        {
          id: '4R9uw',
          type: 'CANVAS_NODE',
          position: {
            x: 692.8030379746835,
            y: -13.82025316455696,
          },
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 137,
          data: null,
        },
      ],
      edges: [
        {
          source: 'opVRl',
          sourceHandle: 'opVRl/tBBxU',
          target: '4R9uw',
          targetHandle: '4R9uw/qWffq',
          id: 'dwKGf',
          style: {
            strokeWidth: 2,
          },
        },
      ],
      nodeConfigs: {
        'opVRl': {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'opVRl',
          nodeName: 'input1',
          inputVariableIds: [],
          outputVariableIds: [],
        },
        '4R9uw': {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: '4R9uw',
          inputVariableIds: [],
          outputVariableIds: [],
        },
      },
      connectors: {
        'opVRl/tBBxU': {
          type: 'NodeOutput',
          id: 'opVRl/tBBxU',
          name: 'a1',
          nodeId: 'opVRl',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        '4R9uw/qWffq': {
          type: 'NodeInput',
          id: '4R9uw/qWffq',
          name: 'b1',
          nodeId: '4R9uw',
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'opVRl/tBBxU': { value: null },
        '4R9uw/qWffq': { value: null },
      },
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
      globalVariables: {},
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleUpdateConnectors(draft, {
      type: ChangeEventType.UPDATE_CONNECTORS,
      updates: [
        {
          variableId: 'opVRl/tBBxU',
          change: {
            isGlobal: true,
          },
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      edges: [],
      connectors: {
        'opVRl/tBBxU': {
          type: 'NodeOutput',
          id: 'opVRl/tBBxU',
          name: 'a1',
          nodeId: 'opVRl',
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        '4R9uw/qWffq': {
          type: 'NodeInput',
          id: '4R9uw/qWffq',
          name: 'b1',
          nodeId: '4R9uw',
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
        },
      },
    },
  });
});

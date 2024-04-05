import { mergeDeep } from '@dhmk/utils';
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
      nodeConfigsDict: {
        Z6dPf: {
          nodeId: 'Z6dPf',
          type: 'InputNode',
          class: 'Start',
          nodeName: 'input1',
        },
      },
      variablesDict: {
        'Z6dPf/wZf7M': {
          type: 'NodeOutput',
          id: 'Z6dPf/wZf7M',
          nodeId: 'Z6dPf',
          index: 0,
          name: 'var1',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableValueLookUpDicts: [
        {
          'Z6dPf/wZf7M': { value: null },
        },
      ],
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
      variablesDict: {
        'Z6dPf/wZf7M': {
          type: 'NodeOutput',
          id: 'Z6dPf/wZf7M',
          nodeId: 'Z6dPf',
          index: 0,
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
  const prevState = mergeDeep(MOCK_STATE, {
    flowContent: {
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
      nodeConfigsDict: {
        'opVRl': {
          type: 'InputNode',
          nodeId: 'opVRl',
        },
        '4R9uw': {
          type: 'OutputNode',
          nodeId: '4R9uw',
        },
      },
      variablesDict: {
        'opVRl/tBBxU': {
          type: 'NodeOutput',
          id: 'opVRl/tBBxU',
          name: 'a1',
          nodeId: 'opVRl',
          index: 0,
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        '4R9uw/qWffq': {
          type: 'NodeInput',
          id: '4R9uw/qWffq',
          name: 'b1',
          nodeId: '4R9uw',
          index: 0,
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableValueLookUpDicts: [
        {
          'opVRl/tBBxU': { value: null },
          '4R9uw/qWffq': { value: null },
        },
      ],
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
      globalVariables: {},
    },
  });

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
      variablesDict: {
        'opVRl/tBBxU': {
          type: 'NodeOutput',
          id: 'opVRl/tBBxU',
          name: 'a1',
          nodeId: 'opVRl',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        '4R9uw/qWffq': {
          type: 'NodeInput',
          id: '4R9uw/qWffq',
          name: 'b1',
          nodeId: '4R9uw',
          index: 0,
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
        },
      },
    },
  });
});

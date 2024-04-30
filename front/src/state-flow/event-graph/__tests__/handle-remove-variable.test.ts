import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';
import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleRemoveVariable } from '../handle-remove-variable';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleRemoveVariable

test('handleRemoveVariable should remove variable', () => {
  const prevState: State = {
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
          height: 169,
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
        'Z6dPf/zrLpE': {
          type: 'NodeOutput',
          id: 'Z6dPf/zrLpE',
          nodeId: 'Z6dPf',
          name: 'var2',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'Z6dPf/wZf7M': { value: null },
        'Z6dPf/zrLpE': { value: null },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleRemoveVariable(draft, {
      type: ChangeEventType.REMOVING_VARIABLE,
      variableId: 'Z6dPf/zrLpE',
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
  });
});

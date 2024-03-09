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
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
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
          height: 169,
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
        'Z6dPf/zrLpE': {
          id: 'Z6dPf/zrLpE',
          nodeId: 'Z6dPf',
          index: 1,
          name: 'var2',
          type: 'FlowInput',
          valueType: 'String',
        },
      },
      variableValueLookUpDicts: [
        {
          'Z6dPf/wZf7M': null,
          'Z6dPf/zrLpE': null,
        },
      ],
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
    },
  });
});

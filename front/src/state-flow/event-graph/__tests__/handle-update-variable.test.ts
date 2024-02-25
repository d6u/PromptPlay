import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';
import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleUpdateVariable } from '../handle-update-variable';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleUpdateVariable

test('handleUpdateVariable should remove variable', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
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
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleUpdateVariable(draft, {
      type: ChangeEventType.UPDATING_VARIABLE,
      variableId: 'Z6dPf/wZf7M',
      change: {
        name: 'var2',
      },
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
          name: 'var2',
          valueType: 'String',
        },
      },
    },
  });
});

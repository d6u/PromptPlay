import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';
import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleUpdateNodeConfig } from '../handle-update-node-config';
import { MOCK_STATE } from './fixture';

// ANCHOR: Test cases for handleUpdateNodeConfig

test('handleUpdateNodeConfig should add node and nodeConfig', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      nodes: [
        {
          id: 'I6L6E',
          type: 'TextTemplate',
          position: {
            x: 482,
            y: 57,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 328,
        },
      ],
      edges: [],
      nodeConfigsDict: {
        I6L6E: {
          nodeId: 'I6L6E',
          type: 'TextTemplate',
          content: 'Write a poem about {{topic}} in fewer than 10 words.',
        },
      },
      variablesDict: {
        'I6L6E/Ou3oJ': {
          type: 'NodeInput',
          id: 'I6L6E/Ou3oJ',
          name: 'topic',
          nodeId: 'I6L6E',
          index: 0,
          valueType: 'Unknown',
        },
        'I6L6E/content': {
          type: 'NodeOutput',
          id: 'I6L6E/content',
          name: 'content',
          nodeId: 'I6L6E',
          index: 0,
          valueType: 'Unknown',
        },
        'I6L6E/niU2H': {
          type: 'ConditionTarget',
          id: 'I6L6E/niU2H',
          nodeId: 'I6L6E',
        },
      },
      variableValueLookUpDicts: [
        {
          'I6L6E/Ou3oJ': null,
          'I6L6E/content': null,
        },
      ],
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleUpdateNodeConfig(draft, {
      type: ChangeEventType.UPDATING_NODE_CONFIG,
      nodeId: 'I6L6E',
      change: {
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      nodeConfigsDict: {
        I6L6E: {
          nodeId: 'I6L6E',
          type: 'TextTemplate',
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
      },
    },
  });
});

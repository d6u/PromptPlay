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
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'I6L6E',
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        I6L6E: {
          kind: 'Process',
          type: 'TextTemplate',
          nodeId: 'I6L6E',
          inputVariableIds: [],
          outputVariableIds: [],
          content: 'Write a poem about {{topic}} in fewer than 10 words.',
        },
      },
      connectors: {
        'I6L6E/Ou3oJ': {
          type: 'NodeInput',
          id: 'I6L6E/Ou3oJ',
          name: 'topic',
          nodeId: 'I6L6E',
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'I6L6E/content': {
          type: 'NodeOutput',
          id: 'I6L6E/content',
          name: 'content',
          nodeId: 'I6L6E',
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'I6L6E/niU2H': {
          type: 'InCondition',
          id: 'I6L6E/niU2H',
          nodeId: 'I6L6E',
        },
      },
      variableResults: {
        'I6L6E/Ou3oJ': { value: null },
        'I6L6E/content': { value: null },
      },
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
      nodeConfigs: {
        I6L6E: {
          kind: 'Process',
          type: 'TextTemplate',
          nodeId: 'I6L6E',
          inputVariableIds: [],
          outputVariableIds: [],
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
      },
    },
  });
});

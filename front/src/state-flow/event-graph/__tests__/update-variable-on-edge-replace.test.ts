import { produce } from 'immer';
import { expect, test, vi } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { State } from '../event-types';
import { handleEdgeReplacedEvent } from '../update-variable-on-edge-replace';
import { MOCK_STATE } from './fixture';

vi.stubGlobal('alert', () => {});

test('handleEdgeReplacedEvent ignores old and new source variables with the same value type', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'ZUhTs',
          type: 'CANVAS_NODE',
          position: {
            x: 228,
            y: 148,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
        },
        {
          id: 'Is8Op',
          type: 'CANVAS_NODE',
          position: {
            x: 690,
            y: 159,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
        },
        {
          id: 'WHqYI',
          type: 'CANVAS_NODE',
          position: {
            x: 229,
            y: 327,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
        },
      ],
      edges: [
        {
          source: 'ZUhTs',
          sourceHandle: 'ZUhTs/aPZ3h',
          target: 'Is8Op',
          targetHandle: 'Is8Op/5TUFT',
          id: 'ZXnIZ',
          style: {
            strokeWidth: 2,
          },
        },
      ],
      nodeConfigs: {
        ZUhTs: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'ZUhTs',
          nodeName: 'input1',
          inputVariableIds: [],
        },
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
          inputVariableIds: [],
        },
        WHqYI: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'WHqYI',
          nodeName: 'input2',
          inputVariableIds: [],
        },
      },
      connectors: {
        'ZUhTs/aPZ3h': {
          type: 'NodeOutput',
          id: 'ZUhTs/aPZ3h',
          nodeId: 'ZUhTs',
          index: 0,
          name: 'var1',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'Is8Op/5TUFT': {
          type: 'NodeInput',
          id: 'Is8Op/5TUFT',
          nodeId: 'Is8Op',
          index: 0,
          name: 'var3',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'WHqYI/p8a32': {
          type: 'NodeOutput',
          id: 'WHqYI/p8a32',
          nodeId: 'WHqYI',
          index: 0,
          name: 'var2',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'ZUhTs/aPZ3h': { value: null },
        'Is8Op/5TUFT': { value: null },
        'WHqYI/p8a32': { value: null },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleEdgeReplacedEvent(draft, {
      type: ChangeEventType.EDGE_REPLACED,
      oldEdge: {
        source: 'ZUhTs',
        sourceHandle: 'ZUhTs/aPZ3h',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        id: 'ZXnIZ',
        style: {
          strokeWidth: 2,
        },
      },
      newEdge: {
        source: 'WHqYI',
        sourceHandle: 'WHqYI/p8a32',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        id: 'ZmY2F',
        style: {
          strokeWidth: 2,
        },
      },
    });

    expect(r).toEqual([]);
  });

  expect(nextState).toEqual(prevState);
});

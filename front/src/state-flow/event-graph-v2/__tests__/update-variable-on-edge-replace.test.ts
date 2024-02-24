import { produce } from 'immer';
import { expect, test, vi } from 'vitest';

import { ConnectorType, NodeType, VariableValueType } from 'flow-models';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';

import { State } from '../event-graph-util';
import { handleEdgeReplacedEvent } from '../update-variable-on-edge-replace';
import { MOCK_STATE } from './fixture';

vi.stubGlobal('alert', () => {});

test('handleEdgeReplacedEvent ignores old and new source variables with the same value type', () => {
  const prevState: State = {
    ...MOCK_STATE,
    nodes: [
      {
        id: 'ZUhTs',
        type: NodeType.InputNode,
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
        type: NodeType.OutputNode,
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
        type: NodeType.InputNode,
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
    nodeConfigsDict: {
      ZUhTs: {
        nodeId: 'ZUhTs',
        type: NodeType.InputNode,
      },
      Is8Op: {
        nodeId: 'Is8Op',
        type: NodeType.OutputNode,
      },
      WHqYI: {
        nodeId: 'WHqYI',
        type: NodeType.InputNode,
      },
    },
    variablesDict: {
      'ZUhTs/aPZ3h': {
        type: ConnectorType.FlowInput,
        id: 'ZUhTs/aPZ3h',
        nodeId: 'ZUhTs',
        index: 0,
        name: 'var1',
        valueType: VariableValueType.String,
      },
      'Is8Op/5TUFT': {
        type: ConnectorType.FlowOutput,
        id: 'Is8Op/5TUFT',
        nodeId: 'Is8Op',
        index: 0,
        name: 'var3',
        valueType: VariableValueType.String,
      },
      'WHqYI/p8a32': {
        type: ConnectorType.FlowInput,
        id: 'WHqYI/p8a32',
        nodeId: 'WHqYI',
        index: 0,
        name: 'var2',
        valueType: VariableValueType.String,
      },
    },
    variableValueLookUpDicts: [
      {
        'ZUhTs/aPZ3h': null,
        'Is8Op/5TUFT': null,
        'WHqYI/p8a32': null,
      },
    ],
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

test('handleEdgeReplacedEvent updates destination variables value type', () => {
  const prevState = {
    ...MOCK_STATE,
    variablesDict: {
      a1: {
        type: ConnectorType.NodeOutput,
        valueType: VariableValueType.Unknown,
      },
      c1: {
        type: ConnectorType.NodeOutput,
        valueType: VariableValueType.String,
      },
      b1: {
        type: ConnectorType.FlowOutput,
        valueType: VariableValueType.Unknown,
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleEdgeReplacedEvent(draft, {
      type: ChangeEventType.EDGE_REPLACED,
      oldEdge: {
        id: 'e1',
        source: 'a',
        sourceHandle: 'a1',
        target: 'b',
        targetHandle: 'b1',
      },
      newEdge: {
        id: 'e2',
        source: 'c',
        sourceHandle: 'c1',
        target: 'b',
        targetHandle: 'b1',
      },
    });

    expect(r).toEqual([
      {
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariable: {
          type: ConnectorType.FlowOutput,
          valueType: VariableValueType.Unknown,
        },
        nextVariable: {
          type: ConnectorType.FlowOutput,
          valueType: VariableValueType.String,
        },
      },
    ]);
  });

  expect(nextState).toEqual({
    ...prevState,
    variablesDict: {
      ...prevState.variablesDict,
      b1: {
        type: ConnectorType.FlowOutput,
        valueType: VariableValueType.String,
      },
    },
  });
});

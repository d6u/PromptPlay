import { produce } from 'immer';
import { expect, test, vi } from 'vitest';

import {
  ConnectorID,
  ConnectorMap,
  ConnectorType,
  EdgeID,
  NodeConfigMap,
  NodeID,
  NodeType,
  VariableValueType,
} from 'flow-models';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';

import { BaseEvent, State } from '../event-graph-util';
import {
  handleReactFlowConnect,
  handleReactFlowConnectEvent,
} from '../handle-reactflow-connect';
import { MOCK_STATE } from './fixture';

vi.stubGlobal('alert', () => {});

// ANCHOR: Test cases for handleReactFlowConnectEvent

test('handleReactFlowConnectEvent ignores self connect', () => {
  const state = produce(MOCK_STATE, (draft) => {
    const r = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'a',
        sourceHandle: '1',
        targetHandle: '2',
      },
    });

    expect(r).toEqual([]);
  });

  expect(state).toEqual(MOCK_STATE);
});

test('handleReactFlowConnectEvent ignores existing connection', () => {
  const prevState = {
    ...MOCK_STATE,
    edges: [
      {
        id: '1' as EdgeID,
        source: 'a' as NodeID,
        target: 'b' as NodeID,
        sourceHandle: '1' as ConnectorID,
        targetHandle: '2' as ConnectorID,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '1',
        targetHandle: '2',
      },
    });

    expect(r).toEqual([]);
  });

  expect(nextState).toEqual(prevState);
});

test('handleReactFlowConnectEvent ignores Audio source variable with invalid target variable', () => {
  const prevState = {
    ...MOCK_STATE,
    edges: [
      {
        id: 'e' as EdgeID,
        source: 'a' as NodeID,
        target: 'b' as NodeID,
        sourceHandle: '1' as ConnectorID,
        targetHandle: '2' as ConnectorID,
      },
    ],
    variablesDict: {
      '1': {
        id: '1' as ConnectorID,
        type: ConnectorType.NodeOutput,
        valueType: VariableValueType.Audio,
      },
    } as ConnectorMap,
    nodeConfigsDict: {
      c: {
        id: 'c' as NodeID,
        type: NodeType.InputNode,
      },
    } as NodeConfigMap,
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'c',
        sourceHandle: '1',
        targetHandle: '2',
      },
    });

    expect(r).toEqual([]);
  });

  expect(nextState).toEqual(prevState);
});

test('handleReactFlowConnectEvent add edge', () => {
  const prevState = {
    ...MOCK_STATE,
    variablesDict: {
      '1': {
        id: '1' as ConnectorID,
        type: ConnectorType.NodeOutput,
        valueType: VariableValueType.Unknown,
      },
      '2': {
        id: '2' as ConnectorID,
        type: ConnectorType.NodeInput,
        valueType: VariableValueType.Unknown,
      },
    } as ConnectorMap,
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '1',
        targetHandle: '2',
      },
    });

    expect(r).toEqual([
      {
        type: ChangeEventType.EDGE_ADDED,
        edge: {
          id: expect.any(String),
          source: 'a' as NodeID,
          target: 'b' as NodeID,
          sourceHandle: '1' as ConnectorID,
          targetHandle: '2' as ConnectorID,
          style: expect.any(Object),
        },
      },
    ]);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [
      {
        id: expect.any(String),
        source: 'a' as NodeID,
        target: 'b' as NodeID,
        sourceHandle: '1' as ConnectorID,
        targetHandle: '2' as ConnectorID,
        style: expect.any(Object),
      },
    ],
  });
});

test('handleReactFlowConnectEvent replace edge', () => {
  const prevState = {
    ...MOCK_STATE,
    edges: [
      {
        id: 'e' as EdgeID,
        source: 'a' as NodeID,
        target: 'b' as NodeID,
        sourceHandle: '1' as ConnectorID,
        targetHandle: '3' as ConnectorID,
      },
    ],
    variablesDict: {
      '1': {
        id: '1' as ConnectorID,
        type: ConnectorType.NodeOutput,
        valueType: VariableValueType.Unknown,
      },
      '2': {
        id: '2' as ConnectorID,
        type: ConnectorType.NodeOutput,
        valueType: VariableValueType.Unknown,
      },
      '3': {
        id: '3' as ConnectorID,
        type: ConnectorType.NodeInput,
        valueType: VariableValueType.Unknown,
      },
    } as ConnectorMap,
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '2',
        targetHandle: '3',
      },
    });

    expect(r).toEqual([
      {
        type: ChangeEventType.EDGE_REPLACED,
        oldEdge: {
          id: expect.any(String),
          source: 'a' as NodeID,
          target: 'b' as NodeID,
          sourceHandle: '1' as ConnectorID,
          targetHandle: '3' as ConnectorID,
        },
        newEdge: {
          id: expect.any(String),
          source: 'a' as NodeID,
          target: 'b' as NodeID,
          sourceHandle: '2' as ConnectorID,
          targetHandle: '3' as ConnectorID,
          style: expect.any(Object),
        },
      },
    ]);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [
      {
        id: expect.any(String),
        source: 'a' as NodeID,
        target: 'b' as NodeID,
        sourceHandle: '2' as ConnectorID,
        targetHandle: '3' as ConnectorID,
        style: expect.any(Object),
      },
    ],
  });
});

test('handleReactFlowConnectEvent add condition', () => {
  const prevState = {
    ...MOCK_STATE,
    variablesDict: {
      '1': {
        id: '1' as ConnectorID,
        type: ConnectorType.Condition,
        valueType: VariableValueType.Unknown,
      },
      '2': {
        id: '2' as ConnectorID,
        type: ConnectorType.ConditionTarget,
        valueType: VariableValueType.Unknown,
      },
    } as ConnectorMap,
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '1',
        targetHandle: '2',
      },
    });

    expect(r).toEqual([
      {
        type: ChangeEventType.EDGE_ADDED,
        edge: {
          id: expect.any(String),
          source: 'a' as NodeID,
          target: 'b' as NodeID,
          sourceHandle: '1' as ConnectorID,
          targetHandle: '2' as ConnectorID,
          style: expect.any(Object),
        },
      },
    ]);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [
      {
        id: expect.any(String),
        source: 'a' as NodeID,
        target: 'b' as NodeID,
        sourceHandle: '1' as ConnectorID,
        targetHandle: '2' as ConnectorID,
        style: expect.any(Object),
      },
    ],
  });
});

// ANCHOR: Test cases for handleReactFlowConnect

test('handleReactFlowConnect should replace edge', () => {
  const prevState: State = {
    ...MOCK_STATE,
    nodes: [
      {
        id: 'ZUhTs',
        type: 'InputNode',
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
        type: 'OutputNode',
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
        type: 'InputNode',
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
        id: 'lfx3a',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    nodeConfigsDict: {
      ZUhTs: {
        nodeId: 'ZUhTs',
        type: 'InputNode',
      },
      Is8Op: {
        nodeId: 'Is8Op',
        type: 'OutputNode',
      },
      WHqYI: {
        nodeId: 'WHqYI',
        type: 'InputNode',
      },
    },
    variablesDict: {
      'ZUhTs/aPZ3h': {
        type: 'FlowInput',
        id: 'ZUhTs/aPZ3h',
        nodeId: 'ZUhTs',
        index: 0,
        name: 'var1',
        valueType: 'String',
      },
      'Is8Op/5TUFT': {
        type: 'FlowOutput',
        id: 'Is8Op/5TUFT',
        nodeId: 'Is8Op',
        index: 0,
        name: 'var3',
        valueType: 'String',
      },
      'WHqYI/p8a32': {
        type: 'FlowInput',
        id: 'WHqYI/p8a32',
        nodeId: 'WHqYI',
        index: 0,
        name: 'var2',
        valueType: 'String',
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
    handleReactFlowConnect(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'WHqYI',
        sourceHandle: 'WHqYI/p8a32',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
      },
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [
      {
        id: expect.any(String),
        source: 'WHqYI',
        sourceHandle: 'WHqYI/p8a32',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        style: {
          strokeWidth: 2,
        },
      },
    ],
  });
});

test('handleReactFlowConnect should replace edge and update dest variable value type', () => {
  const prevState: State = {
    ...MOCK_STATE,
    nodes: [
      {
        id: 'Is8Op',
        type: 'OutputNode',
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
        id: 'gso6A',
        type: 'ElevenLabs',
        position: {
          x: 261.9504000000001,
          y: 61.293199999999956,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 352,
      },
      {
        id: '7NHli',
        type: 'InputNode',
        position: {
          x: 260.58199999999994,
          y: 454.024,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
      },
    ],
    edges: [
      {
        source: '7NHli',
        sourceHandle: '7NHli/g2iSG',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        id: '8oIxa',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    nodeConfigsDict: {
      Is8Op: {
        nodeId: 'Is8Op',
        type: 'OutputNode',
      },
      gso6A: {
        nodeId: 'gso6A',
        type: 'ElevenLabs',
      },
      '7NHli': {
        nodeId: '7NHli',
        type: 'InputNode',
      },
    },
    variablesDict: {
      'Is8Op/5TUFT': {
        type: 'FlowOutput',
        id: 'Is8Op/5TUFT',
        nodeId: 'Is8Op',
        index: 0,
        name: 'var3',
        valueType: 'String',
      },
      'gso6A/text': {
        type: 'NodeInput',
        id: 'gso6A/text',
        name: 'text',
        nodeId: 'gso6A',
        index: 0,
        valueType: 'Unknown',
      },
      'gso6A/audio': {
        type: 'NodeOutput',
        id: 'gso6A/audio',
        name: 'audio',
        nodeId: 'gso6A',
        index: 0,
        valueType: 'Audio',
      },
      'gso6A/MNYNr': {
        type: 'ConditionTarget',
        id: 'gso6A/MNYNr',
        nodeId: 'gso6A',
      },
      '7NHli/g2iSG': {
        type: 'FlowInput',
        id: '7NHli/g2iSG',
        nodeId: '7NHli',
        index: 0,
        name: 'tu',
        valueType: 'String',
      },
    },
    variableValueLookUpDicts: [
      {
        'Is8Op/5TUFT': null,
        'gso6A/text': null,
        'gso6A/audio': null,
        '7NHli/g2iSG': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowConnect(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'gso6A',
        sourceHandle: 'gso6A/audio',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
      },
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [
      {
        id: expect.any(String),
        source: 'gso6A',
        sourceHandle: 'gso6A/audio',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    variablesDict: {
      ...prevState.variablesDict,
      'Is8Op/5TUFT': {
        id: 'Is8Op/5TUFT',
        index: 0,
        name: 'var3',
        nodeId: 'Is8Op',
        type: 'FlowOutput',
        valueType: 'Audio',
      },
    },
  });
});

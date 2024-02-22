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
import { BatchTestTab } from 'state-flow/types';

import { handleReactFlowConnectEvent } from '../handle-reactflow-connect';

vi.stubGlobal('alert', () => {});

const MOCK_STATE = {
  // Persist to server
  nodes: [],
  edges: [],
  nodeConfigsDict: {},
  variablesDict: {},
  variableValueLookUpDicts: [{}],
  // Local
  isFlowContentDirty: false,
  isFlowContentSaving: false,

  selectedBatchTestTab: BatchTestTab.RunTests,

  csvModeSelectedPresetId: null,
  csvEvaluationIsLoading: false,

  // Local data
  csvStr: '',
  csvEvaluationConfigContent: {
    repeatTimes: 1,
    concurrencyLimit: 2,
    variableIdToCsvColumnIndexMap: {},
    runOutputTable: [],
    runMetadataTable: [],
  },
};

test('handleReactFlowConnectEvent ignores self connect', () => {
  const state = { ...MOCK_STATE };

  const r = handleReactFlowConnectEvent(state, {
    type: ChangeEventType.RF_ON_CONNECT,
    connection: {
      source: 'a',
      target: 'a',
      sourceHandle: '1',
      targetHandle: '2',
    },
  });

  expect(r).toEqual([]);
  expect(state).toEqual(MOCK_STATE);
});

test('handleReactFlowConnectEvent ignores existing connection', () => {
  const r = handleReactFlowConnectEvent(
    {
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
    },
    {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '1',
        targetHandle: '2',
      },
    },
  );

  expect(r).toEqual([]);
});

test('handleReactFlowConnectEvent ignores Audio source variable with invalid target variable', () => {
  const r = handleReactFlowConnectEvent(
    {
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
    },
    {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'c',
        sourceHandle: '1',
        targetHandle: '2',
      },
    },
  );

  expect(r).toEqual([]);
});

test('handleReactFlowConnectEvent add edge', () => {
  const r = handleReactFlowConnectEvent(
    {
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
    },
    {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '1',
        targetHandle: '2',
      },
    },
  );

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

test('handleReactFlowConnectEvent replace edge', () => {
  const r = handleReactFlowConnectEvent(
    {
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
    },
    {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '2',
        targetHandle: '3',
      },
    },
  );

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

test('handleReactFlowConnectEvent add condition', () => {
  const r = handleReactFlowConnectEvent(
    {
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
    },
    {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '1',
        targetHandle: '2',
      },
    },
  );

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

import { produce } from 'immer';
import { expect, test, vi } from 'vitest';

import {
  ConnectorID,
  ConnectorType,
  EdgeID,
  NodeID,
  VariableValueType,
} from 'flow-models';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';
import { BatchTestTab } from 'state-flow/types';

import { handleEdgeReplacedEvent } from '../update-variable-on-edge-replace';

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

test('handleEdgeReplacedEvent ignores old and new source variables with the same value type', () => {
  const prevState = {
    ...MOCK_STATE,
    variablesDict: {
      a1: { type: ConnectorType.NodeOutput },
      c1: { type: ConnectorType.NodeOutput },
      b1: { type: ConnectorType.NodeInput },
    },
  };

  const nextState = produce(prevState, (draft) => {
    const r = handleEdgeReplacedEvent(draft, {
      type: ChangeEventType.EDGE_REPLACED,
      oldEdge: {
        id: 'e1' as EdgeID,
        source: 'a' as NodeID,
        sourceHandle: 'a1' as ConnectorID,
        target: 'b' as NodeID,
        targetHandle: 'b1' as ConnectorID,
      },
      newEdge: {
        id: 'e2' as EdgeID,
        source: 'c' as NodeID,
        sourceHandle: 'c1' as ConnectorID,
        target: 'b' as NodeID,
        targetHandle: 'b1' as ConnectorID,
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
        id: 'e1' as EdgeID,
        source: 'a' as NodeID,
        sourceHandle: 'a1' as ConnectorID,
        target: 'b' as NodeID,
        targetHandle: 'b1' as ConnectorID,
      },
      newEdge: {
        id: 'e2' as EdgeID,
        source: 'c' as NodeID,
        sourceHandle: 'c1' as ConnectorID,
        target: 'b' as NodeID,
        targetHandle: 'b1' as ConnectorID,
      },
    });

    expect(r).toEqual([
      {
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig: {
          type: ConnectorType.FlowOutput,
          valueType: VariableValueType.Unknown,
        },
        nextVariableConfig: {
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

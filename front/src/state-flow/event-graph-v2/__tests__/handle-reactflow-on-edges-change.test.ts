import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';

import { BaseEvent, State } from '../event-graph-util';
import { handleReactFlowEdgesChange } from '../handle-reactflow-on-edges-change';
import { MOCK_STATE } from './fixture';

// ANCHOR: handleReactFlowEdgesChange test cases

test('handleReactFlowEdgesChange should select edge', () => {
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
        id: 'OYlVw',
        type: 'InputNode',
        position: {
          x: 321.8085333333334,
          y: 150.6265333333333,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
      },
    ],
    edges: [
      {
        source: 'OYlVw',
        sourceHandle: 'OYlVw/u4bDV',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        id: 'F0Y38',
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
      OYlVw: {
        nodeId: 'OYlVw',
        type: 'InputNode',
      },
    },
    variablesDict: {
      'Is8Op/5TUFT': {
        type: 'FlowOutput',
        id: 'Is8Op/5TUFT',
        nodeId: 'Is8Op',
        index: 0,
        name: 'var2',
        valueType: 'String',
      },
      'OYlVw/u4bDV': {
        type: 'FlowInput',
        id: 'OYlVw/u4bDV',
        nodeId: 'OYlVw',
        index: 0,
        name: 'var1',
        valueType: 'String',
      },
    },
    variableValueLookUpDicts: [
      {
        'Is8Op/5TUFT': null,
        'OYlVw/u4bDV': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowEdgesChange(draft, {
      type: ChangeEventType.RF_EDGES_CHANGE,
      changes: [
        {
          id: 'F0Y38',
          type: 'select',
          selected: true,
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [
      {
        source: 'OYlVw',
        sourceHandle: 'OYlVw/u4bDV',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        id: 'F0Y38',
        style: {
          strokeWidth: 2,
        },
        selected: true,
      },
    ],
  });
});

test('handleReactFlowEdgesChange should remove edge', () => {
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
        id: 'OYlVw',
        type: 'InputNode',
        position: {
          x: 321.8085333333334,
          y: 150.6265333333333,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
      },
    ],
    edges: [
      {
        source: 'OYlVw',
        sourceHandle: 'OYlVw/u4bDV',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        id: 'F0Y38',
        style: {
          strokeWidth: 2,
        },
        selected: true,
      },
    ],
    nodeConfigsDict: {
      Is8Op: {
        nodeId: 'Is8Op',
        type: 'OutputNode',
      },
      OYlVw: {
        nodeId: 'OYlVw',
        type: 'InputNode',
      },
    },
    variablesDict: {
      'Is8Op/5TUFT': {
        type: 'FlowOutput',
        id: 'Is8Op/5TUFT',
        nodeId: 'Is8Op',
        index: 0,
        name: 'var2',
        valueType: 'String',
      },
      'OYlVw/u4bDV': {
        type: 'FlowInput',
        id: 'OYlVw/u4bDV',
        nodeId: 'OYlVw',
        index: 0,
        name: 'var1',
        valueType: 'String',
      },
    },
    variableValueLookUpDicts: [
      {
        'Is8Op/5TUFT': null,
        'OYlVw/u4bDV': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowEdgesChange(draft, {
      type: ChangeEventType.RF_EDGES_CHANGE,
      changes: [
        {
          id: 'F0Y38',
          type: 'remove',
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [],
  });
});

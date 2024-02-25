import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';

import { BaseEvent, State } from '../event-graph-util';
import { handleReactFlowNodesChange } from '../handle-reactflow-on-nodes-change';
import { MOCK_STATE } from './fixture';

// ANCHOR: handleReactFlowNodesChange test cases

test('handleReactFlowNodesChange should remove node', () => {
  const prevState: State = {
    ...MOCK_STATE,
    nodes: [
      {
        id: 'Is8Op',
        type: 'OutputNode',
        position: {
          x: 888.2297300886163,
          y: 225.92526667211996,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
      },
      {
        id: 'xAw4x',
        type: 'InputNode',
        position: {
          x: 487.48366504430805,
          y: 230.14659999999998,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
        selected: true,
      },
    ],
    edges: [],
    nodeConfigsDict: {
      Is8Op: {
        nodeId: 'Is8Op',
        type: 'OutputNode',
      },
      xAw4x: {
        nodeId: 'xAw4x',
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
      'xAw4x/DWHIh': {
        type: 'FlowInput',
        id: 'xAw4x/DWHIh',
        nodeId: 'xAw4x',
        index: 0,
        name: 'var1',
        valueType: 'String',
      },
    },
    variableValueLookUpDicts: [
      {
        'Is8Op/5TUFT': null,
        'xAw4x/DWHIh': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowNodesChange(draft, {
      type: ChangeEventType.RF_NODES_CHANGE,
      changes: [
        {
          id: 'xAw4x',
          type: 'remove',
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    nodes: [
      {
        id: 'Is8Op',
        type: 'OutputNode',
        position: {
          x: 888.2297300886163,
          y: 225.92526667211996,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
      },
    ],
    edges: [],
    nodeConfigsDict: {
      Is8Op: {
        nodeId: 'Is8Op',
        type: 'OutputNode',
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
    },
    variableValueLookUpDicts: [
      {
        'Is8Op/5TUFT': null,
      },
    ],
  });
});

test('handleReactFlowNodesChange should remove multiple nodes', () => {
  const prevState: State = {
    ...MOCK_STATE,
    nodes: [
      {
        id: 'Is8Op',
        type: 'OutputNode',
        position: {
          x: 1020.7297300886163,
          y: 195.92526667211996,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
        selected: true,
        positionAbsolute: {
          x: 1020.7297300886163,
          y: 195.92526667211996,
        },
        dragging: false,
      },
      {
        id: 'ZMITb',
        type: 'InputNode',
        position: {
          x: 652.3963967552829,
          y: 194.0086000054533,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 132,
        selected: true,
        positionAbsolute: {
          x: 652.3963967552829,
          y: 194.0086000054533,
        },
        dragging: false,
      },
    ],
    edges: [],
    nodeConfigsDict: {
      Is8Op: {
        nodeId: 'Is8Op',
        type: 'OutputNode',
      },
      ZMITb: {
        nodeId: 'ZMITb',
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
      'ZMITb/PNDNu': {
        type: 'FlowInput',
        id: 'ZMITb/PNDNu',
        nodeId: 'ZMITb',
        index: 0,
        name: 'var1',
        valueType: 'String',
      },
    },
    variableValueLookUpDicts: [
      {
        'Is8Op/5TUFT': null,
        'ZMITb/PNDNu': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowNodesChange(draft, {
      type: ChangeEventType.RF_NODES_CHANGE,
      changes: [
        {
          id: 'Is8Op',
          type: 'remove',
        },
        {
          id: 'ZMITb',
          type: 'remove',
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    nodes: [],
    edges: [],
    nodeConfigsDict: {},
    variablesDict: {},
    variableValueLookUpDicts: [{}],
  });
});

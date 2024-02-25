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

test('handleReactFlowEdgesChange should remove edge and reset the value type of the target variable of the removed edge', () => {
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
        id: 'VhWOu',
        type: 'ElevenLabs',
        position: {
          x: 540.0709333333333,
          y: 211.22993333333335,
        },
        data: null,
        dragHandle: '.node-drag-handle',
        width: 300,
        height: 352,
      },
    ],
    edges: [
      {
        source: 'VhWOu',
        sourceHandle: 'VhWOu/audio',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
        id: 'qVJeE',
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
      VhWOu: {
        nodeId: 'VhWOu',
        type: 'ElevenLabs',
        voiceId: '',
      },
    },
    variablesDict: {
      'Is8Op/5TUFT': {
        type: 'FlowOutput',
        id: 'Is8Op/5TUFT',
        nodeId: 'Is8Op',
        index: 0,
        name: 'var2',
        valueType: 'Audio',
      },
      'VhWOu/text': {
        type: 'NodeInput',
        id: 'VhWOu/text',
        name: 'text',
        nodeId: 'VhWOu',
        index: 0,
        valueType: 'Unknown',
      },
      'VhWOu/audio': {
        type: 'NodeOutput',
        id: 'VhWOu/audio',
        name: 'audio',
        nodeId: 'VhWOu',
        index: 0,
        valueType: 'Audio',
      },
      'VhWOu/H8v1p': {
        type: 'ConditionTarget',
        id: 'VhWOu/H8v1p',
        nodeId: 'VhWOu',
      },
    },
    variableValueLookUpDicts: [
      {
        'Is8Op/5TUFT': null,
        'VhWOu/text': null,
        'VhWOu/audio': null,
      },
    ],
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowEdgesChange(draft, {
      type: ChangeEventType.RF_EDGES_CHANGE,
      changes: [
        {
          id: 'qVJeE',
          type: 'remove',
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    edges: [],
    variablesDict: {
      ...prevState.variablesDict,
      'Is8Op/5TUFT': {
        type: 'FlowOutput',
        id: 'Is8Op/5TUFT',
        nodeId: 'Is8Op',
        index: 0,
        name: 'var2',
        valueType: 'String',
      },
    },
  });
});

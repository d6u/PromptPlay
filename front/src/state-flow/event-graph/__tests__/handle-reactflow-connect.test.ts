import { produce } from 'immer';
import { expect, test, vi } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import {
  handleReactFlowConnect,
  handleReactFlowConnectEvent,
} from '../handle-reactflow-connect';
import { MOCK_STATE } from './fixture';

vi.stubGlobal('alert', () => {});

// ANCHOR: Test cases for handleReactFlowConnectEvent

test('handleReactFlowConnectEvent ignores self connect', () => {
  const prevState: State = {
    ...MOCK_STATE,
  };

  const state = produce(prevState, (draft) => {
    const events = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'a',
        sourceHandle: '1',
        targetHandle: '2',
      },
    });

    expect(events).toEqual([]);
  });

  expect(state).toEqual(MOCK_STATE);
});

test('handleReactFlowConnectEvent ignores existing connection', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'TmZiV',
          type: 'InputNode',
          position: {
            x: 304,
            y: 147,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
        },
        {
          id: 'af2pT',
          type: 'OutputNode',
          position: {
            x: 686,
            y: 107,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
        },
      ],
      edges: [
        {
          source: 'TmZiV',
          sourceHandle: 'TmZiV/yhv1Z',
          target: 'af2pT',
          targetHandle: 'af2pT/goHde',
          id: 'vBtz0',
          style: {
            strokeWidth: 2,
          },
        },
      ],
      nodeConfigsDict: {
        TmZiV: {
          nodeId: 'TmZiV',
          type: 'InputNode',
        },
        af2pT: {
          nodeId: 'af2pT',
          type: 'OutputNode',
        },
      },
      variablesDict: {
        'TmZiV/yhv1Z': {
          type: 'FlowInput',
          id: 'TmZiV/yhv1Z',
          nodeId: 'TmZiV',
          index: 0,
          name: 'os',
          valueType: 'String',
        },
        'af2pT/goHde': {
          type: 'FlowOutput',
          id: 'af2pT/goHde',
          nodeId: 'af2pT',
          index: 0,
          name: 'veow',
          valueType: 'String',
        },
      },
      variableValueLookUpDicts: [
        {
          'TmZiV/yhv1Z': null,
          'af2pT/goHde': null,
        },
      ],
    },
  };

  const nextState = produce(prevState, (draft) => {
    const events = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'TmZiV',
        target: 'af2pT',
        sourceHandle: 'TmZiV/yhv1Z',
        targetHandle: 'af2pT/goHde',
      },
    });

    expect(events).toEqual([]);
  });

  expect(nextState).toEqual(prevState);
});

test('handleReactFlowConnectEvent ignores Audio source variable with invalid target variable', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'Lbola',
          type: 'ElevenLabs',
          position: {
            x: 231.66666666666663,
            y: -25.75000000000003,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 352,
        },
        {
          id: 'jvWCV',
          type: 'TextTemplate',
          position: {
            x: 627.5,
            y: -13.250000000000028,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 328,
        },
      ],
      edges: [],
      nodeConfigsDict: {
        Lbola: {
          nodeId: 'Lbola',
          type: 'ElevenLabs',
          voiceId: '',
        },
        jvWCV: {
          nodeId: 'jvWCV',
          type: 'TextTemplate',
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
      },
      variablesDict: {
        'Lbola/text': {
          type: 'NodeInput',
          id: 'Lbola/text',
          name: 'text',
          nodeId: 'Lbola',
          index: 0,
          valueType: 'Unknown',
        },
        'Lbola/audio': {
          type: 'NodeOutput',
          id: 'Lbola/audio',
          name: 'audio',
          nodeId: 'Lbola',
          index: 0,
          valueType: 'Audio',
        },
        'Lbola/wvQiz': {
          type: 'ConditionTarget',
          id: 'Lbola/wvQiz',
          nodeId: 'Lbola',
        },
        'jvWCV/ouGHs': {
          type: 'NodeInput',
          id: 'jvWCV/ouGHs',
          name: 'topic',
          nodeId: 'jvWCV',
          index: 0,
          valueType: 'Unknown',
        },
        'jvWCV/content': {
          type: 'NodeOutput',
          id: 'jvWCV/content',
          name: 'content',
          nodeId: 'jvWCV',
          index: 0,
          valueType: 'Unknown',
        },
        'jvWCV/DBCCW': {
          type: 'ConditionTarget',
          id: 'jvWCV/DBCCW',
          nodeId: 'jvWCV',
        },
      },
      variableValueLookUpDicts: [
        {
          'Lbola/text': null,
          'Lbola/audio': null,
          'jvWCV/ouGHs': null,
          'jvWCV/content': null,
        },
      ],
    },
  };

  const nextState = produce(prevState, (draft) => {
    const events = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'Lbola',
        target: 'jvWCV',
        sourceHandle: 'Lbola/audio',
        targetHandle: 'jvWCV/ouGHs',
      },
    });

    expect(events).toEqual([]);
  });

  expect(nextState).toEqual(prevState);
});

test('handleReactFlowConnectEvent add edge', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      variablesDict: {
        '1': {
          id: '1',
          type: 'NodeOutput',
          valueType: 'Unknown',
          nodeId: '',
          index: 0,
          name: 'var1',
        },
        '2': {
          id: '2',
          type: 'NodeInput',
          valueType: 'Unknown',
          nodeId: '',
          index: 0,
          name: 'var1',
        },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    const events = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '1',
        targetHandle: '2',
      },
    });

    expect(events).toEqual([
      {
        type: ChangeEventType.EDGE_ADDED,
        edge: {
          id: expect.any(String),
          source: 'a',
          target: 'b',
          sourceHandle: '1',
          targetHandle: '2',
          style: expect.any(Object),
        },
      },
    ]);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      edges: [
        {
          id: expect.any(String),
          source: 'a',
          target: 'b',
          sourceHandle: '1',
          targetHandle: '2',
          style: expect.any(Object),
        },
      ],
    },
  });
});

test('handleReactFlowConnectEvent replace edge', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      edges: [
        {
          id: 'e',
          source: 'a',
          target: 'b',
          sourceHandle: '1',
          targetHandle: '3',
        },
      ],
      variablesDict: {
        '1': {
          id: '1',
          type: 'NodeOutput',
          valueType: 'Unknown',
          nodeId: '',
          index: 0,
          name: 'var1',
        },
        '2': {
          id: '2',
          type: 'NodeOutput',
          valueType: 'Unknown',
          nodeId: '',
          index: 1,
          name: 'var1',
        },
        '3': {
          id: '3',
          type: 'NodeInput',
          valueType: 'Unknown',
          nodeId: '',
          index: 0,
          name: 'var1',
        },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    const events = handleReactFlowConnectEvent(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'a',
        target: 'b',
        sourceHandle: '2',
        targetHandle: '3',
      },
    });

    expect(events).toEqual([
      {
        type: ChangeEventType.EDGE_REPLACED,
        oldEdge: {
          id: expect.any(String),
          source: 'a',
          target: 'b',
          sourceHandle: '1',
          targetHandle: '3',
        },
        newEdge: {
          id: expect.any(String),
          source: 'a',
          target: 'b',
          sourceHandle: '2',
          targetHandle: '3',
          style: expect.any(Object),
        },
      },
    ]);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      edges: [
        {
          id: expect.any(String),
          source: 'a',
          target: 'b',
          sourceHandle: '2',
          targetHandle: '3',
          style: expect.any(Object),
        },
      ],
    },
  });
});

test('handleReactFlowConnectEvent add condition', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      variablesDict: {
        '1': {
          id: '1',
          type: 'Condition',
          nodeId: '',
          index: 0,
          expressionString: '',
        },
        '2': {
          id: '2',
          type: 'ConditionTarget',
          nodeId: '',
        },
      },
    },
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
          source: 'a',
          target: 'b',
          sourceHandle: '1',
          targetHandle: '2',
          style: expect.any(Object),
        },
      },
    ]);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      edges: [
        {
          id: expect.any(String),
          source: 'a',
          target: 'b',
          sourceHandle: '1',
          targetHandle: '2',
          style: expect.any(Object),
        },
      ],
    },
  });
});

// ANCHOR: Test cases for handleReactFlowConnect

test('handleReactFlowConnect should replace edge', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
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
    },
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
    flowContent: {
      ...prevState.flowContent,
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
    },
  });
});

test('handleReactFlowConnect should replace edge and update dest variable valueType', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
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
        'Is8Op': {
          nodeId: 'Is8Op',
          type: 'OutputNode',
        },
        'gso6A': {
          nodeId: 'gso6A',
          type: 'ElevenLabs',
          voiceId: '',
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
    },
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
    flowContent: {
      ...prevState.flowContent,
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
        ...prevState.flowContent.variablesDict,
        'Is8Op/5TUFT': {
          id: 'Is8Op/5TUFT',
          index: 0,
          name: 'var3',
          nodeId: 'Is8Op',
          type: 'FlowOutput',
          valueType: 'Audio',
        },
      },
    },
  });
});

test('handleReactFlowConnect should add edge', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
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
      edges: [],
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
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowConnect(draft, {
      type: ChangeEventType.RF_ON_CONNECT,
      connection: {
        source: 'OYlVw',
        sourceHandle: 'OYlVw/u4bDV',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
      },
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      edges: [
        {
          id: expect.any(String),
          source: 'OYlVw',
          sourceHandle: 'OYlVw/u4bDV',
          target: 'Is8Op',
          targetHandle: 'Is8Op/5TUFT',
          style: {
            strokeWidth: 2,
          },
        },
      ],
    },
  });
});

test('handleReactFlowConnect should add edge and update dest variable valueType', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
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
      ],
      edges: [],
      nodeConfigsDict: {
        Is8Op: {
          type: 'OutputNode',
          nodeId: 'Is8Op',
        },
        gso6A: {
          type: 'ElevenLabs',
          nodeId: 'gso6A',
          voiceId: '',
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
      },
      variableValueLookUpDicts: [
        {
          'Is8Op/5TUFT': null,
          'gso6A/text': null,
          'gso6A/audio': null,
        },
      ],
    },
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
    flowContent: {
      ...prevState.flowContent,
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
        ...prevState.flowContent.variablesDict,
        'Is8Op/5TUFT': {
          id: 'Is8Op/5TUFT',
          index: 0,
          name: 'var3',
          nodeId: 'Is8Op',
          type: 'FlowOutput',
          // TODO: Better presenting that valueType is changed
          valueType: 'Audio',
        },
      },
    },
  });
});

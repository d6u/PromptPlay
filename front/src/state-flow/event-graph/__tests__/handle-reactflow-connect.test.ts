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
          type: 'CANVAS_NODE',
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
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        TmZiV: {
          kind: 'Start',
          nodeId: 'TmZiV',
          type: 'InputNode',
          nodeName: 'input1',
          inputVariableIds: [],
        },
        af2pT: {
          kind: 'Finish',
          nodeId: 'af2pT',
          type: 'OutputNode',
          inputVariableIds: [],
        },
      },
      connectors: {
        'TmZiV/yhv1Z': {
          type: 'NodeOutput',
          id: 'TmZiV/yhv1Z',
          nodeId: 'TmZiV',
          index: 0,
          name: 'os',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'af2pT/goHde': {
          type: 'NodeInput',
          id: 'af2pT/goHde',
          nodeId: 'af2pT',
          index: 0,
          name: 'veow',
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'TmZiV/yhv1Z': { value: null },
        'af2pT/goHde': { value: null },
      },
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
          type: 'CANVAS_NODE',
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
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        Lbola: {
          kind: 'Process',
          type: 'ElevenLabs',
          nodeId: 'Lbola',
          inputVariableIds: [],
          voiceId: '',
        },
        jvWCV: {
          kind: 'Process',
          type: 'TextTemplate',
          nodeId: 'jvWCV',
          inputVariableIds: [],
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
      },
      connectors: {
        'Lbola/text': {
          type: 'NodeInput',
          id: 'Lbola/text',
          name: 'text',
          nodeId: 'Lbola',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'Lbola/audio': {
          type: 'NodeOutput',
          id: 'Lbola/audio',
          name: 'audio',
          nodeId: 'Lbola',
          index: 0,
          valueType: 'Audio',
          isGlobal: true,
          globalVariableId: null,
        },
        'Lbola/wvQiz': {
          type: 'InCondition',
          id: 'Lbola/wvQiz',
          nodeId: 'Lbola',
        },
        'jvWCV/ouGHs': {
          type: 'NodeInput',
          id: 'jvWCV/ouGHs',
          name: 'topic',
          nodeId: 'jvWCV',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'jvWCV/content': {
          type: 'NodeOutput',
          id: 'jvWCV/content',
          name: 'content',
          nodeId: 'jvWCV',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'jvWCV/DBCCW': {
          type: 'InCondition',
          id: 'jvWCV/DBCCW',
          nodeId: 'jvWCV',
        },
      },
      variableResults: {
        'Lbola/text': { value: null },
        'Lbola/audio': { value: null },
        'jvWCV/ouGHs': { value: null },
        'jvWCV/content': { value: null },
      },
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
      connectors: {
        '1': {
          type: 'NodeOutput',
          id: '1',
          valueType: 'String',
          nodeId: '',
          index: 0,
          name: 'var1',
          isGlobal: true,
          globalVariableId: null,
        },
        '2': {
          type: 'NodeInput',
          id: '2',
          valueType: 'String',
          nodeId: '',
          index: 0,
          name: 'var1',
          isGlobal: true,
          globalVariableId: null,
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
      connectors: {
        '1': {
          id: '1',
          type: 'NodeOutput',
          valueType: 'String',
          nodeId: '',
          index: 0,
          name: 'var1',
          isGlobal: true,
          globalVariableId: null,
        },
        '2': {
          id: '2',
          type: 'NodeOutput',
          valueType: 'String',
          nodeId: '',
          index: 1,
          name: 'var1',
          isGlobal: true,
          globalVariableId: null,
        },
        '3': {
          id: '3',
          type: 'NodeInput',
          valueType: 'String',
          nodeId: '',
          index: 0,
          name: 'var1',
          isGlobal: true,
          globalVariableId: null,
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
      connectors: {
        '1': {
          id: '1',
          type: 'OutCondition',
          nodeId: '',
          index: 0,
          expressionString: '',
        },
        '2': {
          id: '2',
          type: 'InCondition',
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
          id: 'lfx3a',
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
          id: 'gso6A',
          type: 'CANVAS_NODE',
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
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        'Is8Op': {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
          inputVariableIds: [],
        },
        'gso6A': {
          kind: 'Process',
          type: 'ElevenLabs',
          nodeId: 'gso6A',
          inputVariableIds: [],
          voiceId: '',
        },
        '7NHli': {
          kind: 'Start',
          type: 'InputNode',
          nodeId: '7NHli',
          nodeName: 'input1',
          inputVariableIds: [],
        },
      },
      connectors: {
        'Is8Op/5TUFT': {
          type: 'NodeInput',
          id: 'Is8Op/5TUFT',
          nodeId: 'Is8Op',
          index: 0,
          name: 'var3',
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
        },
        'gso6A/text': {
          type: 'NodeInput',
          id: 'gso6A/text',
          name: 'text',
          nodeId: 'gso6A',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'gso6A/audio': {
          type: 'NodeOutput',
          id: 'gso6A/audio',
          name: 'audio',
          nodeId: 'gso6A',
          index: 0,
          valueType: 'Audio',
          isGlobal: true,
          globalVariableId: null,
        },
        'gso6A/MNYNr': {
          type: 'InCondition',
          id: 'gso6A/MNYNr',
          nodeId: 'gso6A',
        },
        '7NHli/g2iSG': {
          type: 'NodeOutput',
          id: '7NHli/g2iSG',
          nodeId: '7NHli',
          index: 0,
          name: 'tu',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'Is8Op/5TUFT': { value: null },
        'gso6A/text': { value: null },
        'gso6A/audio': { value: null },
        '7NHli/g2iSG': { value: null },
      },
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
      connectors: {
        ...prevState.flowContent.connectors,
        'Is8Op/5TUFT': {
          id: 'Is8Op/5TUFT',
          index: 0,
          name: 'var3',
          nodeId: 'Is8Op',
          type: 'NodeInput',
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
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
          id: 'OYlVw',
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
          inputVariableIds: [],
        },
        OYlVw: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'OYlVw',
          nodeName: 'input1',
          inputVariableIds: [],
        },
      },
      connectors: {
        'Is8Op/5TUFT': {
          type: 'NodeInput',
          id: 'Is8Op/5TUFT',
          nodeId: 'Is8Op',
          index: 0,
          name: 'var2',
          valueType: 'Any',
          isGlobal: false,
          globalVariableId: null,
        },
        'OYlVw/u4bDV': {
          type: 'NodeOutput',
          id: 'OYlVw/u4bDV',
          nodeId: 'OYlVw',
          index: 0,
          name: 'var1',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'Is8Op/5TUFT': { value: null },
        'OYlVw/u4bDV': { value: null },
      },
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
          id: 'gso6A',
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
          inputVariableIds: [],
        },
        gso6A: {
          kind: 'Process',
          type: 'ElevenLabs',
          nodeId: 'gso6A',
          inputVariableIds: [],
          voiceId: '',
        },
      },
      connectors: {
        'Is8Op/5TUFT': {
          type: 'NodeInput',
          id: 'Is8Op/5TUFT',
          nodeId: 'Is8Op',
          index: 0,
          name: 'var3',
          valueType: 'Any',
          isGlobal: true,
          globalVariableId: null,
        },
        'gso6A/text': {
          type: 'NodeInput',
          id: 'gso6A/text',
          name: 'text',
          nodeId: 'gso6A',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'gso6A/audio': {
          type: 'NodeOutput',
          id: 'gso6A/audio',
          name: 'audio',
          nodeId: 'gso6A',
          index: 0,
          valueType: 'Audio',
          isGlobal: true,
          globalVariableId: null,
        },
        'gso6A/MNYNr': {
          type: 'InCondition',
          id: 'gso6A/MNYNr',
          nodeId: 'gso6A',
        },
      },
      variableResults: {
        'Is8Op/5TUFT': { value: null },
        'gso6A/text': { value: null },
        'gso6A/audio': { value: null },
      },
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
      connectors: {
        ...prevState.flowContent.connectors,
        'Is8Op/5TUFT': {
          id: 'Is8Op/5TUFT',
          index: 0,
          name: 'var3',
          nodeId: 'Is8Op',
          type: 'NodeInput',
          valueType: 'Any',
          isGlobal: true,
          globalVariableId: null,
        },
      },
    },
  });
});

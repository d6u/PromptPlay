import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleReactFlowEdgesChange } from '../handle-reactflow-on-edges-change';
import { MOCK_STATE } from './fixture';

// ANCHOR: handleReactFlowEdgesChange test cases

test('handleReactFlowEdgesChange should select edge', () => {
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
      nodeConfigs: {
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
        },
        OYlVw: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'OYlVw',
          nodeName: 'input1',
        },
      },
      connectors: {
        'Is8Op/5TUFT': {
          type: 'NodeInput',
          id: 'Is8Op/5TUFT',
          nodeId: 'Is8Op',
          index: 0,
          name: 'var2',
          valueType: 'String',
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
    flowContent: {
      ...prevState.flowContent,
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
    },
  });
});

test('handleReactFlowEdgesChange should remove edge', () => {
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
      nodeConfigs: {
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
        },
        OYlVw: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'OYlVw',
          nodeName: 'input1',
        },
      },
      connectors: {
        'Is8Op/5TUFT': {
          type: 'NodeInput',
          id: 'Is8Op/5TUFT',
          nodeId: 'Is8Op',
          index: 0,
          name: 'var2',
          valueType: 'String',
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
    flowContent: {
      ...prevState.flowContent,
      edges: [],
    },
  });
});

test('handleReactFlowEdgesChange should remove multiple edges', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'HIbCf',
          type: 'CANVAS_NODE',
          position: {
            x: 606.5630634219496,
            y: 144.8419333387866,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
          selected: false,
          positionAbsolute: {
            x: 606.5630634219496,
            y: 144.8419333387866,
          },
          dragging: false,
        },
        {
          id: 'sn268',
          type: 'CANVAS_NODE',
          position: {
            x: 1439.0630634219494,
            y: 131.50860000545333,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 169,
          selected: false,
          positionAbsolute: {
            x: 1439.0630634219494,
            y: 131.50860000545333,
          },
          dragging: false,
        },
        {
          id: 'AkRxM',
          type: 'CANVAS_NODE',
          position: {
            x: 989.0630634219492,
            y: 179.0086000054534,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 328,
          selected: true,
          positionAbsolute: {
            x: 989.0630634219492,
            y: 179.0086000054534,
          },
          dragging: false,
        },
      ],
      edges: [
        {
          source: 'AkRxM',
          sourceHandle: 'AkRxM/content',
          target: 'sn268',
          targetHandle: 'sn268/TweWr',
          id: 'TSL0N',
          style: {
            strokeWidth: 2,
          },
          selected: true,
        },
        {
          source: 'HIbCf',
          sourceHandle: 'HIbCf/sCWR7',
          target: 'AkRxM',
          targetHandle: 'AkRxM/QCSCO',
          id: '0GtZJ',
          style: {
            strokeWidth: 2,
          },
          selected: true,
        },
      ],
      nodeConfigs: {
        HIbCf: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'HIbCf',
          nodeName: 'input1',
        },
        sn268: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'sn268',
        },
        AkRxM: {
          kind: 'Process',
          type: 'TextTemplate',
          nodeId: 'AkRxM',
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
      },
      connectors: {
        'HIbCf/sCWR7': {
          type: 'NodeOutput',
          id: 'HIbCf/sCWR7',
          nodeId: 'HIbCf',
          index: 0,
          name: 'var1',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'sn268/mt4IG': {
          type: 'NodeInput',
          id: 'sn268/mt4IG',
          nodeId: 'sn268',
          index: 0,
          name: 'var2',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'sn268/TweWr': {
          id: 'sn268/TweWr',
          nodeId: 'sn268',
          index: 1,
          name: 'var3',
          type: 'NodeInput',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'AkRxM/QCSCO': {
          type: 'NodeInput',
          id: 'AkRxM/QCSCO',
          name: 'topic',
          nodeId: 'AkRxM',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'AkRxM/content': {
          type: 'NodeOutput',
          id: 'AkRxM/content',
          name: 'content',
          nodeId: 'AkRxM',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'AkRxM/5qUcP': {
          type: 'InCondition',
          id: 'AkRxM/5qUcP',
          nodeId: 'AkRxM',
        },
      },
      variableResults: {
        'HIbCf/sCWR7': { value: null },
        'sn268/mt4IG': { value: null },
        'sn268/TweWr': { value: null },
        'AkRxM/QCSCO': { value: null },
        'AkRxM/content': { value: null },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowEdgesChange(draft, {
      type: ChangeEventType.RF_EDGES_CHANGE,
      changes: [
        {
          id: 'TSL0N',
          type: 'remove',
        },
        {
          id: '0GtZJ',
          type: 'remove',
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      ...prevState.flowContent,
      edges: [],
    },
  });
});

test('handleReactFlowEdgesChange should remove edge and reset the value type of the target variable of the removed edge', () => {
  const prevState: State = {
    ...MOCK_STATE,
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'Is8Op',
          type: 'CANVAS_NODE',
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
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
        },
        VhWOu: {
          kind: 'Process',
          type: 'ElevenLabs',
          nodeId: 'VhWOu',
          voiceId: '',
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
        'VhWOu/text': {
          type: 'NodeInput',
          id: 'VhWOu/text',
          name: 'text',
          nodeId: 'VhWOu',
          index: 0,
          valueType: 'String',
          isGlobal: true,
          globalVariableId: null,
        },
        'VhWOu/audio': {
          type: 'NodeOutput',
          id: 'VhWOu/audio',
          name: 'audio',
          nodeId: 'VhWOu',
          index: 0,
          valueType: 'Audio',
          isGlobal: true,
          globalVariableId: null,
        },
        'VhWOu/H8v1p': {
          type: 'InCondition',
          id: 'VhWOu/H8v1p',
          nodeId: 'VhWOu',
        },
      },
      variableResults: {
        'Is8Op/5TUFT': { value: null },
        'VhWOu/text': { value: null },
        'VhWOu/audio': { value: null },
      },
    },
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
    flowContent: {
      ...prevState.flowContent,
      edges: [],
      connectors: {
        ...prevState.flowContent.connectors,
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
      },
    },
  });
});

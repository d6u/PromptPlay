import { produce } from 'immer';
import { expect, test } from 'vitest';

import { ChangeEventType } from 'state-flow/event-graph/event-types';

import { BaseEvent } from '../event-graph-util';
import { State } from '../event-types';
import { handleReactFlowNodesChange } from '../handle-reactflow-on-nodes-change';
import { MOCK_STATE } from './fixture';

// ANCHOR: handleReactFlowNodesChange test cases

test('handleReactFlowNodesChange should remove node', () => {
  const prevState: State = {
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
          id: 'xAw4x',
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        xAw4x: {
          kind: 'Start',
          nodeId: 'xAw4x',
          type: 'InputNode',
          nodeName: 'input1',
          inputVariableIds: [],
        },
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
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
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'xAw4x/DWHIh': {
          type: 'NodeOutput',
          id: 'xAw4x/DWHIh',
          nodeId: 'xAw4x',
          index: 0,
          name: 'var1',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'Is8Op/5TUFT': { value: null },
        'xAw4x/DWHIh': { value: null },
      },
    },
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
    flowContent: {
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
      ],
      edges: [],
      nodeConfigs: {
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
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
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      conditionResults: {},
      variableResults: {
        'Is8Op/5TUFT': { value: null },
      },
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
      globalVariables: {},
      runFlowStates: expect.anything(),
    },
  });
});

test('handleReactFlowNodesChange should remove connector and edge connected', () => {
  const prevState: State = {
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'HIbCf',
          type: 'CANVAS_NODE',
          position: {
            x: 672.6255634219496,
            y: 144.8419333387866,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
          selected: true,
        },
        {
          id: 'sn268',
          type: 'CANVAS_NODE',
          position: {
            x: 1049.2943134219495,
            y: 152.27110000545335,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
        },
      ],
      edges: [
        {
          source: 'HIbCf',
          sourceHandle: 'HIbCf/sCWR7',
          target: 'sn268',
          targetHandle: 'sn268/mt4IG',
          id: 'gcU08',
          style: {
            strokeWidth: 2,
          },
        },
      ],
      nodeConfigs: {
        HIbCf: {
          kind: 'Start',
          type: 'InputNode',
          nodeId: 'HIbCf',
          nodeName: 'input1',
          inputVariableIds: [],
        },
        sn268: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'sn268',
          inputVariableIds: [],
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
      },
      variableResults: {
        'HIbCf/sCWR7': { value: null },
        'sn268/mt4IG': { value: null },
      },
    },
  };

  const nextState = produce(prevState, (draft) => {
    handleReactFlowNodesChange(draft, {
      type: ChangeEventType.RF_NODES_CHANGE,
      changes: [
        {
          id: 'HIbCf',
          type: 'remove',
        },
      ],
    } as BaseEvent);
  });

  expect(nextState).toEqual({
    ...prevState,
    flowContent: {
      nodes: [
        {
          id: 'sn268',
          type: 'CANVAS_NODE',
          position: {
            x: 1049.2943134219495,
            y: 152.27110000545335,
          },
          data: null,
          dragHandle: '.node-drag-handle',
          width: 300,
          height: 132,
        },
      ],
      edges: [],
      nodeConfigs: {
        sn268: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'sn268',
          inputVariableIds: [],
        },
      },
      connectors: {
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
      },
      conditionResults: {},
      variableResults: {
        'sn268/mt4IG': { value: null },
      },
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
      globalVariables: {},
      runFlowStates: expect.anything(),
    },
  });
});

test('handleReactFlowNodesChange should remove multiple nodes', () => {
  const prevState: State = {
    flowContent: {
      ...MOCK_STATE.flowContent,
      nodes: [
        {
          id: 'Is8Op',
          type: 'CANVAS_NODE',
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
          type: 'CANVAS_NODE',
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
      nodeConfigs: {
        ZMITb: {
          kind: 'Start',
          nodeId: 'ZMITb',
          type: 'InputNode',
          nodeName: 'input1',
          inputVariableIds: [],
        },
        Is8Op: {
          kind: 'Finish',
          type: 'OutputNode',
          nodeId: 'Is8Op',
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
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
        'ZMITb/PNDNu': {
          type: 'NodeOutput',
          id: 'ZMITb/PNDNu',
          nodeId: 'ZMITb',
          index: 0,
          name: 'var1',
          valueType: 'String',
          isGlobal: false,
          globalVariableId: null,
        },
      },
      variableResults: {
        'Is8Op/5TUFT': { value: null },
        'ZMITb/PNDNu': { value: null },
      },
    },
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
    flowContent: {
      nodes: [],
      edges: [],
      nodeConfigs: {},
      connectors: {},
      globalVariables: {},
      conditionResults: {},
      variableResults: {},
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
      runFlowStates: expect.anything(),
    },
  });
});

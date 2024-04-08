import { ReplaySubject, lastValueFrom, tap } from 'rxjs';
import { expect, test } from 'vitest';

import {
  CanvasDataV4,
  ImmutableFlowNodeGraph,
  NodeTypeEnum,
} from 'flow-models';

import runFlow from '../runFlow';
import { getNodeAllLevelConfigOrValidationErrors } from '../util';

test('runFlow should execute', async () => {
  const flowContent: CanvasDataV4 = {
    nodes: [
      {
        id: 'GjREx',
        type: 'CANVAS_NODE',
        position: {
          x: 246,
          y: 208,
        },
      },
      {
        id: '9hKOz',
        type: 'CANVAS_NODE',
        position: {
          x: 637,
          y: 207,
        },
      },
    ],
    edges: [
      {
        source: 'GjREx',
        sourceHandle: 'GjREx/URLME',
        target: '9hKOz',
        targetHandle: '9hKOz/c5NYh',
        id: 'HxCix',
      },
    ],
    nodeConfigs: {
      'GjREx': {
        type: 'InputNode',
        nodeId: 'GjREx',
        class: 'Start',
        nodeName: 'input1',
      },
      '9hKOz': {
        type: 'OutputNode',
        nodeId: '9hKOz',
        class: 'Finish',
      },
    },
    connectors: {
      'GjREx/URLME': {
        type: 'NodeOutput',
        id: 'GjREx/URLME',
        name: 'input',
        nodeId: 'GjREx',
        index: 0,
        valueType: 'String',
        isGlobal: false,
        globalVariableId: null,
      },
      '9hKOz/c5NYh': {
        type: 'NodeInput',
        id: '9hKOz/c5NYh',
        name: 'output',
        nodeId: '9hKOz',
        index: 0,
        valueType: 'Any',
        isGlobal: false,
        globalVariableId: null,
      },
    },
    conditionResults: {},
    variableResults: {
      'GjREx/URLME': { value: 'test' },
      '9hKOz/c5NYh': { value: null },
    },
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: ['GjREx'],
    nodeConfigs: flowContent.nodeConfigs,
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    connectors: flowContent.connectors,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const runResult = await lastValueFrom(
    runFlow({
      nodeConfigs: result.nodeAllLevelConfigs!,
      connectors: flowContent.connectors,
      inputVariableValues: flowContent.variableResults,
      preferStreaming: false,
      flowGraph: immutableFlowGraph,
      progressObserver: progressObserver,
    }),
  );

  expect(runResult).toEqual({
    errors: [],
    variableResults: {
      '9hKOz/c5NYh': { value: 'test' },
    },
  });

  let n = 0;

  const events = [
    {
      type: 'Started',
      nodeId: 'GjREx',
    },
    {
      type: 'Updated',
      nodeId: 'GjREx',
      result: {
        variableValues: ['test'],
        variableResults: {
          'GjREx/URLME': { value: 'test' },
        },
        completedConnectorIds: ['GjREx/URLME'],
      },
    },
    {
      type: 'Finished',
      nodeId: 'GjREx',
    },
    {
      type: 'Started',
      nodeId: '9hKOz',
    },
    {
      type: 'Updated',
      nodeId: '9hKOz',
      result: {
        variableValues: ['test'],
        variableResults: {
          '9hKOz/c5NYh': { value: 'test' },
        },
      },
    },
    {
      type: 'Finished',
      nodeId: '9hKOz',
    },
  ];

  // NOTE: Must use tap to wrap assertion because subscribe doesn't stop
  // the observable on exception.
  await lastValueFrom(
    progressObserver.pipe(
      tap((event) => {
        expect(event).toEqual(events[n]);
        n++;
      }),
    ),
  );
});

test('runFlow should block node has multiple conditions when only one condition was met', async () => {
  const flowContent: CanvasDataV4 = {
    nodes: [
      {
        id: 'RaCH9',
        type: 'CANVAS_NODE',
        position: {
          x: 547.4675078864354,
          y: 65.71388012618294,
        },
      },
      {
        id: 'xXyHK',
        type: 'CANVAS_NODE',
        position: {
          x: 1308.5324921135648,
          y: 354.55962145110414,
        },
      },
      {
        id: 'eguWZ',
        type: 'CANVAS_NODE',
        position: {
          x: 918,
          y: 65,
        },
      },
    ],
    edges: [
      {
        id: 'CpurZ',
        source: 'eguWZ',
        sourceHandle: 'eguWZ/4jeQm',
        target: 'xXyHK',
        targetHandle: 'xXyHK/2DgJO',
      },
      {
        id: 'Y13Qn',
        source: 'RaCH9',
        sourceHandle: 'RaCH9/N2lpW',
        target: 'eguWZ',
        targetHandle: 'eguWZ/V3QMJ',
      },
      {
        source: 'eguWZ',
        sourceHandle: 'eguWZ/krYU5',
        target: 'xXyHK',
        targetHandle: 'xXyHK/2DgJO',
        id: 'ckxCB',
      },
    ],
    nodeConfigs: {
      RaCH9: {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'RaCH9',
        nodeName: 'input',
      },
      eguWZ: {
        class: 'Process',
        type: 'ConditionNode',
        nodeId: 'eguWZ',
        stopAtTheFirstMatch: true,
      },
      xXyHK: {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'xXyHK',
      },
    },
    connectors: {
      'RaCH9/N2lpW': {
        type: 'Condition',
        id: 'RaCH9/N2lpW',
        nodeId: 'RaCH9',
        index: 0,
        expressionString: '',
      },
      'RaCH9/X5oE1': {
        type: 'NodeOutput',
        id: 'RaCH9/X5oE1',
        name: 'input',
        nodeId: 'RaCH9',
        index: 0,
        valueType: 'String',
        isGlobal: true,
        globalVariableId: 'WJVEH',
      },
      'eguWZ/4jeQm': {
        type: 'Condition',
        id: 'eguWZ/4jeQm',
        nodeId: 'eguWZ',
        index: 0,
        expressionString: '$ = "A"',
      },
      'eguWZ/PUOO2': {
        type: 'Condition',
        id: 'eguWZ/PUOO2',
        nodeId: 'eguWZ',
        index: -1,
        expressionString: '',
      },
      'eguWZ/V3QMJ': {
        type: 'ConditionTarget',
        id: 'eguWZ/V3QMJ',
        nodeId: 'eguWZ',
      },
      'eguWZ/input': {
        type: 'NodeInput',
        id: 'eguWZ/input',
        name: 'input',
        nodeId: 'eguWZ',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'WJVEH',
      },
      'eguWZ/krYU5': {
        type: 'Condition',
        id: 'eguWZ/krYU5',
        nodeId: 'eguWZ',
        index: 1,
        expressionString: '$ = "B"',
      },
      'xXyHK/2DgJO': {
        type: 'ConditionTarget',
        id: 'xXyHK/2DgJO',
        nodeId: 'xXyHK',
      },
      'xXyHK/Zse2K': {
        type: 'NodeInput',
        id: 'xXyHK/Zse2K',
        name: 'output',
        nodeId: 'xXyHK',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'WJVEH',
      },
    },
    globalVariables: {
      WJVEH: {
        id: 'WJVEH',
        name: 'target_var',
        valueType: 'Unspecified',
      },
    },
    conditionResults: {},
    variableResults: {
      'RaCH9/X5oE1': {
        value: 'A',
      },
    },
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: ['RaCH9'],
    nodeConfigs: flowContent.nodeConfigs,
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    connectors: flowContent.connectors,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    flowGraph: immutableFlowGraph,
    progressObserver: progressObserver,
  });

  // NOTE: Cannot use RxJS marble testing because Observable consuming Promise
  // is not supported.

  const actual = await lastValueFrom(obs);

  expect(actual).toEqual({ errors: [], variableResults: {} });

  let n = 0;

  const values = [
    {
      type: 'Started',
      nodeId: 'RaCH9',
    },
    {
      type: 'Updated',
      nodeId: 'RaCH9',
      result: {
        variableValues: ['A'],
        variableResults: {
          'RaCH9/X5oE1': { value: 'A' },
        },
        completedConnectorIds: ['RaCH9/X5oE1'],
      },
    },
    {
      type: 'Finished',
      nodeId: 'RaCH9',
    },
    {
      type: 'Started',
      nodeId: 'eguWZ',
    },
    {
      type: 'Updated',
      nodeId: 'eguWZ',
      result: {
        conditionResults: {
          'eguWZ/4jeQm': {
            conditionId: 'eguWZ/4jeQm',
            isConditionMatched: true,
          },
        },
        variableResults: {},
        completedConnectorIds: ['eguWZ/4jeQm'],
      },
    },
    {
      type: 'Finished',
      nodeId: 'eguWZ',
    },
  ];

  // NOTE: Must use tap to wrap assertion because subscribe doesn't stop
  // the observable on exception.
  await lastValueFrom(
    progressObserver.pipe(
      tap((event) => {
        expect(event).toEqual(values[n]);
        n++;
      }),
    ),
  );

  expect(n).toBe(values.length);
});

test('runFlow should match a case', async () => {
  const flowContent: CanvasDataV4 = {
    nodes: [
      {
        id: 'RaCH9',
        type: 'CANVAS_NODE',
        position: {
          x: 547.4675078864354,
          y: 65.71388012618294,
        },
      },
      {
        id: 'xXyHK',
        type: 'CANVAS_NODE',
        position: {
          x: 1308.5324921135648,
          y: 354.55962145110414,
        },
      },
      {
        id: 'eguWZ',
        type: 'CANVAS_NODE',
        position: {
          x: 918,
          y: 65,
        },
      },
    ],
    edges: [
      {
        id: 'CpurZ',
        source: 'eguWZ',
        sourceHandle: 'eguWZ/4jeQm',
        target: 'xXyHK',
        targetHandle: 'xXyHK/2DgJO',
      },
      {
        id: 'Y13Qn',
        source: 'RaCH9',
        sourceHandle: 'RaCH9/N2lpW',
        target: 'eguWZ',
        targetHandle: 'eguWZ/V3QMJ',
      },
    ],
    nodeConfigs: {
      RaCH9: {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'RaCH9',
        nodeName: 'input',
      },
      eguWZ: {
        class: 'Process',
        type: 'ConditionNode',
        nodeId: 'eguWZ',
        stopAtTheFirstMatch: true,
      },
      xXyHK: {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'xXyHK',
      },
    },
    connectors: {
      'RaCH9/N2lpW': {
        type: 'Condition',
        id: 'RaCH9/N2lpW',
        nodeId: 'RaCH9',
        index: 0,
        expressionString: '',
      },
      'RaCH9/X5oE1': {
        type: 'NodeOutput',
        id: 'RaCH9/X5oE1',
        name: 'input',
        nodeId: 'RaCH9',
        index: 0,
        valueType: 'String',
        isGlobal: true,
        globalVariableId: 'WJVEH',
      },
      'eguWZ/4jeQm': {
        type: 'Condition',
        id: 'eguWZ/4jeQm',
        nodeId: 'eguWZ',
        index: 0,
        expressionString: '$ = "A"',
      },
      'eguWZ/PUOO2': {
        type: 'Condition',
        id: 'eguWZ/PUOO2',
        nodeId: 'eguWZ',
        index: -1,
        expressionString: '',
      },
      'eguWZ/V3QMJ': {
        type: 'ConditionTarget',
        id: 'eguWZ/V3QMJ',
        nodeId: 'eguWZ',
      },
      'eguWZ/input': {
        type: 'NodeInput',
        id: 'eguWZ/input',
        name: 'input',
        nodeId: 'eguWZ',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'WJVEH',
      },
      'eguWZ/krYU5': {
        type: 'Condition',
        id: 'eguWZ/krYU5',
        nodeId: 'eguWZ',
        index: 1,
        expressionString: '$ = "B"',
      },
      'xXyHK/2DgJO': {
        type: 'ConditionTarget',
        id: 'xXyHK/2DgJO',
        nodeId: 'xXyHK',
      },
      'xXyHK/Zse2K': {
        type: 'NodeInput',
        id: 'xXyHK/Zse2K',
        name: 'output',
        nodeId: 'xXyHK',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'WJVEH',
      },
    },
    globalVariables: {
      WJVEH: {
        id: 'WJVEH',
        name: 'target_var',
        valueType: 'Unspecified',
      },
    },
    conditionResults: {},
    variableResults: {
      'RaCH9/X5oE1': {
        value: 'A',
      },
    },
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: ['RaCH9'],
    nodeConfigs: flowContent.nodeConfigs,
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    connectors: flowContent.connectors,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    flowGraph: immutableFlowGraph,
    progressObserver: progressObserver,
  });

  // NOTE: Cannot use RxJS marble testing because Observable consuming Promise
  // is not supported.

  const actual = await lastValueFrom(obs);

  expect(actual).toEqual({ errors: [], variableResults: {} });

  let n = 0;

  const values = [
    {
      type: 'Started',
      nodeId: 'RaCH9',
    },
    {
      type: 'Updated',
      nodeId: 'RaCH9',
      result: {
        variableValues: ['A'],
        variableResults: {
          'RaCH9/X5oE1': { value: 'A' },
        },
        completedConnectorIds: ['RaCH9/X5oE1'],
      },
    },
    {
      type: 'Finished',
      nodeId: 'RaCH9',
    },
    {
      type: 'Started',
      nodeId: 'eguWZ',
    },
    {
      type: 'Updated',
      nodeId: 'eguWZ',
      result: {
        conditionResults: {
          'eguWZ/4jeQm': {
            conditionId: 'eguWZ/4jeQm',
            isConditionMatched: true,
          },
        },
        variableResults: {},
        completedConnectorIds: ['eguWZ/4jeQm'],
      },
    },
    {
      type: 'Finished',
      nodeId: 'eguWZ',
    },
    {
      nodeId: 'xXyHK',
      type: 'Started',
    },
    {
      type: 'Updated',
      nodeId: 'xXyHK',
      result: {
        variableValues: ['A'],
        variableResults: {
          'xXyHK/Zse2K': { value: 'A' },
        },
      },
    },
    {
      nodeId: 'xXyHK',
      type: 'Finished',
    },
  ];

  // NOTE: Must use tap to wrap assertion because subscribe doesn't stop
  // the observable on exception.
  await lastValueFrom(
    progressObserver.pipe(
      tap((event) => {
        expect(event).toEqual(values[n]);
        n++;
      }),
    ),
  );

  expect(n).toBe(values.length);
});

test('runFlow should fallback to default case when no condition was met', async () => {
  const flowContent: CanvasDataV4 = {
    nodes: [
      {
        id: '1w9JM',
        type: 'CANVAS_NODE',
        position: {
          x: 482,
          y: 69.64087591240872,
        },
      },
      {
        id: '2WvHf',
        type: 'CANVAS_NODE',
        position: {
          x: 947.950364963504,
          y: -42.51094890510956,
        },
      },
      {
        id: 'eSpTO',
        type: 'CANVAS_NODE',
        position: {
          x: 950.1595433394162,
          y: 308.9402734945255,
        },
      },
      {
        id: 'itI1z',
        type: 'CANVAS_NODE',
        position: {
          x: 127.98250194599467,
          y: 52.26505737267897,
        },
      },
    ],
    edges: [
      {
        id: 'W8Kmy',
        source: '1w9JM',
        sourceHandle: '1w9JM/hvZie',
        target: '2WvHf',
        targetHandle: '2WvHf/w92gJ',
      },
      {
        id: 'Yy9eh',
        source: '1w9JM',
        sourceHandle: '1w9JM/fR2hj',
        target: '2WvHf',
        targetHandle: '2WvHf/w92gJ',
      },
      {
        id: 'iuUuh',
        source: '1w9JM',
        sourceHandle: '1w9JM/MlBLI',
        target: 'eSpTO',
        targetHandle: 'eSpTO/44B0L',
      },
      {
        id: 'FbKrl',
        source: '1w9JM',
        sourceHandle: '1w9JM/fR2hj',
        target: 'qclxl',
        targetHandle: 'qclxl/l56QJ',
      },
      {
        id: '8tl2S',
        source: 'itI1z',
        sourceHandle: 'itI1z/7cpZ9',
        target: '1w9JM',
        targetHandle: '1w9JM/input',
      },
    ],
    nodeConfigs: {
      '1w9JM': {
        type: 'ConditionNode',
        nodeId: '1w9JM',
        stopAtTheFirstMatch: true,
        class: 'Process',
      },
      '2WvHf': {
        type: 'TextTemplate',
        nodeId: '2WvHf',
        content: 'Write a poem about A in fewer than 20 words.',
        class: 'Process',
      },
      'eSpTO': {
        type: 'TextTemplate',
        nodeId: 'eSpTO',
        content: 'Write a poem about B in fewer than 20 words.',
        class: 'Process',
      },
      'itI1z': {
        type: 'InputNode',
        nodeId: 'itI1z',
        class: 'Start',
        nodeName: 'input1',
      },
    },
    connectors: {
      '1w9JM/input': {
        type: 'NodeInput',
        id: '1w9JM/input',
        name: 'input',
        nodeId: '1w9JM',
        index: 0,
        valueType: 'Any',
        isGlobal: false,
        globalVariableId: null,
      },
      '1w9JM/fR2hj': {
        type: 'Condition',
        id: '1w9JM/fR2hj',
        nodeId: '1w9JM',
        index: -1,
        expressionString: '',
      },
      '1w9JM/hvZie': {
        type: 'Condition',
        id: '1w9JM/hvZie',
        nodeId: '1w9JM',
        index: 0,
        expressionString: '$ = "Value A"',
      },
      '1w9JM/MlBLI': {
        type: 'Condition',
        id: '1w9JM/MlBLI',
        nodeId: '1w9JM',
        index: 1,
        expressionString: '$ = "Value B"',
      },
      '1w9JM/oV9Ad': {
        type: 'ConditionTarget',
        id: '1w9JM/oV9Ad',
        nodeId: '1w9JM',
      },
      '2WvHf/content': {
        type: 'NodeOutput',
        id: '2WvHf/content',
        name: 'content',
        nodeId: '2WvHf',
        index: 0,
        valueType: 'String',
        isGlobal: false,
        globalVariableId: null,
      },
      '2WvHf/w92gJ': {
        type: 'ConditionTarget',
        id: '2WvHf/w92gJ',
        nodeId: '2WvHf',
      },
      'eSpTO/content': {
        type: 'NodeOutput',
        id: 'eSpTO/content',
        name: 'content',
        nodeId: 'eSpTO',
        index: 0,
        valueType: 'String',
        isGlobal: false,
        globalVariableId: null,
      },
      'eSpTO/44B0L': {
        type: 'ConditionTarget',
        id: 'eSpTO/44B0L',
        nodeId: 'eSpTO',
      },
      'itI1z/7cpZ9': {
        type: 'NodeOutput',
        id: 'itI1z/7cpZ9',
        name: 'input',
        nodeId: 'itI1z',
        index: 0,
        valueType: 'String',
        isGlobal: false,
        globalVariableId: null,
      },
    },
    conditionResults: {},
    variableResults: {
      'itI1z/7cpZ9': { value: 'nothing matches' },
      '1w9JM/hvZie': { value: null },
      '2WvHf/content': { value: null },
    },
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: ['itI1z'],
    nodeConfigs: flowContent.nodeConfigs,
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    connectors: flowContent.connectors,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    flowGraph: immutableFlowGraph,
    progressObserver: progressObserver,
  });

  const actual = await lastValueFrom(obs);

  expect(actual).toEqual({ errors: [], variableResults: {} });

  let n = 0;

  const values = [
    {
      type: 'Started',
      nodeId: 'itI1z',
    },
    {
      type: 'Updated',
      nodeId: 'itI1z',
      result: {
        variableValues: ['nothing matches'],
        variableResults: {
          'itI1z/7cpZ9': { value: 'nothing matches' },
        },
        completedConnectorIds: ['itI1z/7cpZ9'],
      },
    },
    {
      type: 'Finished',
      nodeId: 'itI1z',
    },
    {
      type: 'Started',
      nodeId: '1w9JM',
    },
    {
      type: 'Updated',
      nodeId: '1w9JM',
      result: {
        conditionResults: {
          '1w9JM/hvZie': {
            conditionId: '1w9JM/hvZie',
            isConditionMatched: false,
          },
          '1w9JM/MlBLI': {
            conditionId: '1w9JM/MlBLI',
            isConditionMatched: false,
          },
          '1w9JM/fR2hj': {
            conditionId: '1w9JM/fR2hj',
            isConditionMatched: true,
          },
        },
        variableResults: {},
        completedConnectorIds: ['1w9JM/fR2hj'],
      },
    },
    {
      type: 'Finished',
      nodeId: '1w9JM',
    },
    {
      type: 'Started',
      nodeId: '2WvHf',
    },
    {
      type: 'Updated',
      nodeId: '2WvHf',
      result: {
        variableValues: ['Write a poem about A in fewer than 20 words.'],
        variableResults: {
          '2WvHf/content': {
            value: 'Write a poem about A in fewer than 20 words.',
          },
        },
        completedConnectorIds: ['2WvHf/content'],
      },
    },
    {
      type: 'Finished',
      nodeId: '2WvHf',
    },
  ];

  // NOTE: Must use tap to wrap assertion because subscribe doesn't stop
  // the observable on exception.
  await lastValueFrom(
    progressObserver.pipe(
      tap((event) => {
        expect(event).toEqual(values[n]);
        n++;
      }),
    ),
  );
});

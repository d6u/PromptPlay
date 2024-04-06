import { ReplaySubject, lastValueFrom, tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, expect, test } from 'vitest';

import {
  CanvasDataV4,
  ImmutableFlowNodeGraph,
  NodeTypeEnum,
} from 'flow-models';

import runFlow from '../runFlow';
import { getNodeAllLevelConfigOrValidationErrors } from '../util';

let testScheduler: TestScheduler;

beforeEach(() => {
  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

test('runFlow should execute', () => {
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

  testScheduler.run((helpers) => {
    const { expectObservable } = helpers;

    const progressObserver = new ReplaySubject();

    const obs = runFlow({
      nodeConfigs: result.nodeAllLevelConfigs!,
      connectors: flowContent.connectors,
      inputVariableValues: flowContent.variableResults,
      preferStreaming: false,
      flowGraph: immutableFlowGraph,
      progressObserver: progressObserver,
    });

    expectObservable(obs).toBe('(0|)', [
      {
        errors: [],
        variableResults: {
          '9hKOz/c5NYh': { value: 'test' },
        },
      },
    ]);

    expectObservable(progressObserver).toBe('(012345|)', [
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
    ]);
  });
});

test('runFlow should unblock node has multiple conditions even when only one condition was met', async () => {
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
        id: '8tl2S',
        source: 'itI1z',
        sourceHandle: 'itI1z/7cpZ9',
        target: '1w9JM',
        targetHandle: '1w9JM/input',
      },
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
    ],
    nodeConfigs: {
      'itI1z': {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'itI1z',
        nodeName: 'input1',
      },
      '1w9JM': {
        class: 'Process',
        type: 'ConditionNode',
        nodeId: '1w9JM',
        stopAtTheFirstMatch: true,
      },
      '2WvHf': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: '2WvHf',
        content: 'Write a poem about A in fewer than 20 words.',
      },
      'eSpTO': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'eSpTO',
        content: 'Write a poem about B in fewer than 20 words.',
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
      'itI1z/7cpZ9': { value: 'Value A' },
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

  // NOTE: Cannot use RxJS marble testing because Observable consuming Promise
  // is not supported.

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
        variableValues: ['Value A'],
        variableResults: {
          'itI1z/7cpZ9': { value: 'Value A' },
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
            isConditionMatched: true,
          },
        },
        variableResults: {},
        completedConnectorIds: ['1w9JM/hvZie'],
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

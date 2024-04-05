import { ReplaySubject, Subject, lastValueFrom, tap } from 'rxjs';
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
    nodeConfigsDict: {
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
    variablesDict: {
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
    variableValueLookUpDicts: [
      {
        'GjREx/URLME': { value: 'test' },
        '9hKOz/c5NYh': { value: null },
      },
    ],
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: ['GjREx'],
    nodeConfigs: flowContent.nodeConfigsDict,
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    connectors: flowContent.variablesDict,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigsDict,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  testScheduler.run((helpers) => {
    const { expectObservable } = helpers;

    const progressObserver = new ReplaySubject();

    const obs = runFlow({
      nodeConfigs: result.nodeAllLevelConfigs!,
      connectors: flowContent.variablesDict,
      inputValueMap: flowContent.variableValueLookUpDicts[0] as Readonly<
        Record<string, Readonly<unknown>>
      >,
      preferStreaming: false,
      flowGraph: immutableFlowGraph,
      progressObserver: progressObserver,
    });

    expectObservable(obs).toBe('(0|)', [
      {
        variableResults: {
          'GjREx/URLME': { value: 'test' },
          '9hKOz/c5NYh': { value: 'test' },
        },
      },
    ]);

    expectObservable(progressObserver).toBe('(012345)', [
      {
        type: 'Started',
        nodeId: 'GjREx',
      },
      {
        type: 'Updated',
        nodeId: 'GjREx',
        result: {
          connectorResults: {
            'GjREx/URLME': { value: 'test' },
          },
          completedConnectorIds: ['GjREx/URLME'],
          errors: [],
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
          connectorResults: {
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
    nodeConfigsDict: {
      'itI1z': {
        type: 'InputNode',
        nodeId: 'itI1z',
        class: 'Start',
        nodeName: 'input1',
      },
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
    },
    variablesDict: {
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
    variableValueLookUpDicts: [
      {
        'itI1z/7cpZ9': { value: 'Value A' },
        '1w9JM/hvZie': { value: null },
        '2WvHf/content': { value: null },
      },
    ],
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: ['itI1z'],
    nodeConfigs: flowContent.nodeConfigsDict,
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    connectors: flowContent.variablesDict,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigsDict,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const obs = runFlow({
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.variablesDict,
    inputValueMap: flowContent.variableValueLookUpDicts[0] as Readonly<
      Record<string, Readonly<unknown>>
    >,
    preferStreaming: false,
    flowGraph: immutableFlowGraph,
    progressObserver: new Subject(),
  });

  let n = 0;

  const values = [
    {
      type: 'Start',
      nodeId: 'itI1z',
    },
    {
      type: 'NewVariableValues',
      nodeId: 'itI1z',
      variableValuesLookUpDict: {
        'itI1z/7cpZ9': 'Value A',
      },
    },
    {
      type: 'Finish',
      nodeId: 'itI1z',
      finishedConnectorIds: ['itI1z/7cpZ9'],
    },
    {
      type: 'Start',
      nodeId: '1w9JM',
    },
    {
      type: 'NewVariableValues',
      nodeId: '1w9JM',
      variableValuesLookUpDict: {
        '1w9JM/hvZie': {
          conditionId: '1w9JM/hvZie',
          isConditionMatched: true,
        },
      },
    },
    {
      type: 'Finish',
      nodeId: '1w9JM',
      finishedConnectorIds: ['1w9JM/hvZie'],
    },
    {
      type: 'Start',
      nodeId: '2WvHf',
    },
    {
      type: 'NewVariableValues',
      nodeId: '2WvHf',
      variableValuesLookUpDict: {
        '2WvHf/content': 'Write a poem about A in fewer than 20 words.',
      },
    },
    {
      type: 'Finish',
      nodeId: '2WvHf',
      finishedConnectorIds: ['2WvHf/content'],
    },
  ];

  await lastValueFrom(
    obs.pipe(
      // Must run expect in tap because when expect throwing error in subscribe,
      // it does not stop the subscription.
      tap((event) => {
        expect(event, `event ${n} should match expected value`).toEqual(
          values[n],
        );
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
    nodeConfigsDict: {
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
    variablesDict: {
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
    variableValueLookUpDicts: [
      {
        'itI1z/7cpZ9': { value: 'nothing matches' },
        '1w9JM/hvZie': { value: null },
        '2WvHf/content': { value: null },
      },
    ],
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: ['itI1z'],
    nodeConfigs: flowContent.nodeConfigsDict,
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    connectors: flowContent.variablesDict,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigsDict,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const obs = runFlow({
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.variablesDict,
    inputValueMap: flowContent.variableValueLookUpDicts[0] as Readonly<
      Record<string, Readonly<unknown>>
    >,
    preferStreaming: false,
    flowGraph: immutableFlowGraph,
    progressObserver: new Subject(),
  });

  let n = 0;

  const values = [
    {
      type: 'Start',
      nodeId: 'itI1z',
    },
    {
      type: 'NewVariableValues',
      nodeId: 'itI1z',
      variableValuesLookUpDict: {
        'itI1z/7cpZ9': 'nothing matches',
      },
    },
    {
      type: 'Finish',
      nodeId: 'itI1z',
      finishedConnectorIds: ['itI1z/7cpZ9'],
    },
    {
      type: 'Start',
      nodeId: '1w9JM',
    },
    {
      type: 'NewVariableValues',
      nodeId: '1w9JM',
      variableValuesLookUpDict: {
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
    },
    {
      type: 'Finish',
      nodeId: '1w9JM',
      finishedConnectorIds: ['1w9JM/fR2hj'],
    },
    {
      type: 'Start',
      nodeId: '2WvHf',
    },
    {
      type: 'NewVariableValues',
      nodeId: '2WvHf',
      variableValuesLookUpDict: {
        '2WvHf/content': 'Write a poem about A in fewer than 20 words.',
      },
    },
    {
      type: 'Finish',
      nodeId: '2WvHf',
      finishedConnectorIds: ['2WvHf/content'],
    },
  ];

  await lastValueFrom(
    obs.pipe(
      // Must run expect in tap because when expect throwing error in subscribe,
      // it does not stop the subscription.
      tap((event) => {
        expect(event, `event ${n} should match expected value`).toEqual(
          values[n],
        );
        n++;
      }),
    ),
  );
});

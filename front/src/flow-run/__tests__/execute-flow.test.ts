import { D } from '@mobily/ts-belt';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, expect, test } from 'vitest';

import {
  CanvasDataV3,
  ImmutableFlowNodeGraph,
  NodeTypeEnum,
} from 'flow-models';

import { tap } from 'rxjs';
import { executeFlow } from '../execute-flow';
import { getNodeAllLevelConfigOrValidationErrors } from '../util';

let testScheduler: TestScheduler;

beforeEach(() => {
  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

test('executeFlow should execute', () => {
  const flowContent: CanvasDataV3 = {
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
      },
      '9hKOz': {
        type: 'OutputNode',
        nodeId: '9hKOz',
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
        'GjREx/URLME': 'test',
        '9hKOz/c5NYh': null,
      },
    ],
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    nodeIds: D.keys(flowContent.nodeConfigsDict),
    connectors: flowContent.variablesDict,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigsDict,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  testScheduler.run((helpers) => {
    const { expectObservable } = helpers;

    const values = [
      {
        type: 'Start',
        nodeId: 'GjREx',
      },
      {
        type: 'Finish',
        nodeId: 'GjREx',
        finishedConnectorIds: ['GjREx/URLME'],
      },
      {
        type: 'Start',
        nodeId: '9hKOz',
      },
      {
        type: 'NewVariableValues',
        nodeId: '9hKOz',
        variableValuesLookUpDict: {
          '9hKOz/c5NYh': 'test',
        },
      },
      {
        type: 'Finish',
        nodeId: '9hKOz',
        finishedConnectorIds: [],
      },
    ];

    const expected = '(01234|)';

    const obs = executeFlow({
      nodeConfigs: result.nodeAllLevelConfigs!,
      connectors: flowContent.variablesDict,
      inputValueMap: flowContent.variableValueLookUpDicts[0],
      preferStreaming: false,
      flowGraph: immutableFlowGraph,
    });

    expectObservable(obs).toBe(expected, values);
  });
});

test('executeFlow should unblock node has multiple conditions even when only one condition was met', () => {
  const flowContent: CanvasDataV3 = {
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
      },
      '2WvHf': {
        type: 'TextTemplate',
        nodeId: '2WvHf',
        content: 'Write a poem about A in fewer than 20 words.',
      },
      'eSpTO': {
        type: 'TextTemplate',
        nodeId: 'eSpTO',
        content: 'Write a poem about B in fewer than 20 words.',
      },
      'itI1z': {
        type: 'InputNode',
        nodeId: 'itI1z',
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
        isGlobal: true,
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
        isGlobal: true,
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
        isGlobal: true,
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
        'itI1z/7cpZ9': 'Value A',
        '1w9JM/hvZie': null,
        '2WvHf/content': null,
      },
    ],
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    nodeIds: D.keys(flowContent.nodeConfigsDict),
    connectors: flowContent.variablesDict,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigsDict,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const obs = executeFlow({
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.variablesDict,
    inputValueMap: flowContent.variableValueLookUpDicts[0],
    preferStreaming: false,
    flowGraph: immutableFlowGraph,
  });

  let n = 0;

  const values = [
    {
      type: 'Start',
      nodeId: 'itI1z',
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

  obs
    .pipe(
      // Must run expect in tap because when expect throwing error in subscribe,
      // it does not stop the subscription.
      tap((event) => {
        expect(event, `event ${n} should match expected value`).toEqual(
          values[n],
        );
        n++;
      }),
    )
    .subscribe();
});

test('executeFlow should fallback to default case when no condition was met', () => {
  const flowContent: CanvasDataV3 = {
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
      },
      '2WvHf': {
        type: 'TextTemplate',
        nodeId: '2WvHf',
        content: 'Write a poem about A in fewer than 20 words.',
      },
      'eSpTO': {
        type: 'TextTemplate',
        nodeId: 'eSpTO',
        content: 'Write a poem about B in fewer than 20 words.',
      },
      'itI1z': {
        type: 'InputNode',
        nodeId: 'itI1z',
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
        isGlobal: true,
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
        isGlobal: true,
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
        isGlobal: true,
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
        'itI1z/7cpZ9': 'nothing matches',
        '1w9JM/hvZie': null,
        '2WvHf/content': null,
      },
    ],
    globalVariables: {},
  };

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    edges: flowContent.edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    nodeIds: D.keys(flowContent.nodeConfigsDict),
    connectors: flowContent.variablesDict,
  });

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigsDict,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const obs = executeFlow({
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.variablesDict,
    inputValueMap: flowContent.variableValueLookUpDicts[0],
    preferStreaming: false,
    flowGraph: immutableFlowGraph,
  });

  let n = 0;

  const values = [
    {
      type: 'Start',
      nodeId: 'itI1z',
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

  obs
    .pipe(
      // Must run expect in tap because when expect throwing error in subscribe,
      // it does not stop the subscription.
      tap((event) => {
        expect(event, `event ${n} should match expected value`).toEqual(
          values[n],
        );
        n++;
      }),
    )
    .subscribe();
});

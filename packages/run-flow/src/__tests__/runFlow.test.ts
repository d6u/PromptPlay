import { ReplaySubject, lastValueFrom, tap } from 'rxjs';
import { expect, test } from 'vitest';

import { CanvasDataV4, NodeTypeEnum } from 'flow-models';

import { computeGraphs } from 'graph-util';
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
        id: 'HxCix',
        source: 'GjREx',
        sourceHandle: 'GjREx/URLME',
        target: '9hKOz',
        targetHandle: '9hKOz/c5NYh',
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

  const { errors, graphRecords } = computeGraphs({
    edges: flowContent.edges,
    nodeConfigs: flowContent.nodeConfigs,
    startNodeIds: ['GjREx'],
  });

  expect(errors).toEqual({});

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    edges: flowContent.edges,
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    graphRecords,
    progressObserver: progressObserver,
  });

  // NOTE: We cannot use RxJS marble test here, because it doesn't supported
  // Promise.

  const runResult = await lastValueFrom(obs);

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
        type: 'OutCondition',
        id: '1w9JM/fR2hj',
        nodeId: '1w9JM',
        index: -1,
        expressionString: '',
      },
      '1w9JM/hvZie': {
        type: 'OutCondition',
        id: '1w9JM/hvZie',
        nodeId: '1w9JM',
        index: 0,
        expressionString: '$ = "Value A"',
      },
      '1w9JM/MlBLI': {
        type: 'OutCondition',
        id: '1w9JM/MlBLI',
        nodeId: '1w9JM',
        index: 1,
        expressionString: '$ = "Value B"',
      },
      '1w9JM/oV9Ad': {
        type: 'InCondition',
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
        type: 'InCondition',
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
        type: 'InCondition',
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

  const { errors, graphRecords } = computeGraphs({
    edges: flowContent.edges,
    nodeConfigs: flowContent.nodeConfigs,
    startNodeIds: ['itI1z'],
  });

  expect(errors).toEqual({});

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    edges: flowContent.edges,
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    graphRecords,
    progressObserver: progressObserver,
  });

  // NOTE: We cannot use RxJS marble test here, because it doesn't supported
  // Promise.

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
        type: 'OutCondition',
        id: '1w9JM/fR2hj',
        nodeId: '1w9JM',
        index: -1,
        expressionString: '',
      },
      '1w9JM/hvZie': {
        type: 'OutCondition',
        id: '1w9JM/hvZie',
        nodeId: '1w9JM',
        index: 0,
        expressionString: '$ = "Value A"',
      },
      '1w9JM/MlBLI': {
        type: 'OutCondition',
        id: '1w9JM/MlBLI',
        nodeId: '1w9JM',
        index: 1,
        expressionString: '$ = "Value B"',
      },
      '1w9JM/oV9Ad': {
        type: 'InCondition',
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
        type: 'InCondition',
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
        type: 'InCondition',
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

  const { errors, graphRecords } = computeGraphs({
    edges: flowContent.edges,
    nodeConfigs: flowContent.nodeConfigs,
    startNodeIds: ['itI1z'],
  });

  expect(errors).toEqual({});

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    edges: flowContent.edges,
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    graphRecords,
    progressObserver: progressObserver,
  });

  // NOTE: We cannot use RxJS marble test here, because it doesn't supported
  // Promise.

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

test('runFlow should execute flow contains Loop node (break with 1 iteration)', async () => {
  const flowContent: CanvasDataV4 = {
    nodes: [
      {
        id: 'hElD9',
        type: 'CANVAS_NODE',
        position: { x: -19.09483463821253, y: -265.6607707725781 },
      },
      {
        id: 'gHXou',
        type: 'CANVAS_NODE',
        position: { x: 703.6137319527363, y: -266.40933463153 },
      },
      {
        id: 'Pk4nQ',
        type: 'CANVAS_NODE',
        position: { x: 346.1089144326161, y: -266.7191761147797 },
      },
      {
        id: '9Ui4x',
        type: 'CANVAS_NODE',
        position: { x: -83.18840761562592, y: -25.87853426888462 },
      },
      {
        id: '5w1jr',
        type: 'CANVAS_NODE',
        position: { x: 1033.359864386586, y: 203.165096849583 },
      },
      {
        id: 'apgt9',
        type: 'CANVAS_NODE',
        position: { x: 660.6073266916932, y: -30.09581077085942 },
      },
      {
        id: '8eLuD',
        type: 'CANVAS_NODE',
        position: { x: 295.045265779434, y: -26.09112557543658 },
      },
    ],
    edges: [
      {
        id: 'ARRdC',
        source: 'hElD9',
        sourceHandle: 'hElD9/mAd36',
        target: 'Pk4nQ',
        targetHandle: 'Pk4nQ/7PZhS',
      },
      {
        id: 'WtDm9',
        source: 'Pk4nQ',
        sourceHandle: 'Pk4nQ/jooB9',
        target: 'gHXou',
        targetHandle: 'gHXou/IgTHW',
      },
      {
        id: 'IKWau',
        source: '9Ui4x',
        sourceHandle: '9Ui4x/aNkK1',
        target: '8eLuD',
        targetHandle: '8eLuD/6HSC3',
      },
      {
        id: 'o8MVx',
        source: '8eLuD',
        sourceHandle: '8eLuD/st2vW',
        target: 'apgt9',
        targetHandle: 'apgt9/ViWA9',
      },
      {
        id: 'SVwnK',
        source: 'apgt9',
        sourceHandle: 'apgt9/hTTnq',
        target: '5w1jr',
        targetHandle: '5w1jr/gphwX',
      },
      {
        id: 'Dwc6R',
        source: 'apgt9',
        sourceHandle: 'apgt9/MPwJq',
        target: '5w1jr',
        targetHandle: '5w1jr/Sv19O',
      },
    ],
    nodeConfigs: {
      '5w1jr': {
        class: 'Finish',
        type: 'LoopFinish',
        nodeId: '5w1jr',
      },
      '8eLuD': {
        class: 'Process',
        type: 'JavaScriptFunctionNode',
        nodeId: '8eLuD',
        javaScriptCode: 'count = count ?? 0\ncount++\nreturn count',
      },
      '9Ui4x': {
        class: 'Start',
        type: 'LoopStart',
        nodeId: '9Ui4x',
        nodeName: 'loop1',
      },
      'Pk4nQ': {
        class: 'Process',
        type: 'Loop',
        nodeId: 'Pk4nQ',
        loopStartNodeId: '9Ui4x',
      },
      'apgt9': {
        class: 'Process',
        type: 'ConditionNode',
        nodeId: 'apgt9',
        stopAtTheFirstMatch: true,
      },
      'gHXou': {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'gHXou',
      },
      'hElD9': {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'hElD9',
        nodeName: 'input',
      },
    },
    connectors: {
      '5w1jr/Sv19O': {
        type: 'InCondition',
        id: '5w1jr/Sv19O',
        nodeId: '5w1jr',
        index: 1,
      },
      '5w1jr/gphwX': {
        type: 'InCondition',
        id: '5w1jr/gphwX',
        nodeId: '5w1jr',
        index: 0,
      },
      '8eLuD/6HSC3': {
        type: 'InCondition',
        id: '8eLuD/6HSC3',
        nodeId: '8eLuD',
      },
      '8eLuD/pooal': {
        type: 'NodeInput',
        id: '8eLuD/pooal',
        name: 'count',
        nodeId: '8eLuD',
        index: 1,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
      '8eLuD/st2vW': {
        type: 'OutCondition',
        id: '8eLuD/st2vW',
        nodeId: '8eLuD',
        index: 0,
        expressionString: '',
      },
      '9Ui4x/aNkK1': {
        type: 'OutCondition',
        id: '9Ui4x/aNkK1',
        nodeId: '9Ui4x',
        index: 0,
        expressionString: '',
      },
      'Pk4nQ/7PZhS': {
        type: 'InCondition',
        id: 'Pk4nQ/7PZhS',
        nodeId: 'Pk4nQ',
        index: 0,
      },
      'Pk4nQ/jooB9': {
        type: 'OutCondition',
        id: 'Pk4nQ/jooB9',
        nodeId: 'Pk4nQ',
        index: 0,
        expressionString: '',
      },
      'apgt9/MPwJq': {
        type: 'OutCondition',
        id: 'apgt9/MPwJq',
        nodeId: 'apgt9',
        index: -1,
        expressionString: '',
      },
      'apgt9/ViWA9': {
        type: 'InCondition',
        id: 'apgt9/ViWA9',
        nodeId: 'apgt9',
      },
      'apgt9/hTTnq': {
        type: 'OutCondition',
        id: 'apgt9/hTTnq',
        nodeId: 'apgt9',
        index: 1,
        expressionString: '$ > 3',
      },
      'apgt9/input': {
        type: 'NodeInput',
        id: 'apgt9/input',
        name: 'input',
        nodeId: 'apgt9',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
      'gHXou/IgTHW': {
        type: 'InCondition',
        id: 'gHXou/IgTHW',
        nodeId: 'gHXou',
      },
      'gHXou/ydJi7': {
        type: 'NodeInput',
        id: 'gHXou/ydJi7',
        name: 'output',
        nodeId: 'gHXou',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
      'hElD9/mAd36': {
        type: 'OutCondition',
        id: 'hElD9/mAd36',
        nodeId: 'hElD9',
        index: 0,
        expressionString: '',
      },
      '8eLuD/output': {
        type: 'NodeOutput',
        id: '8eLuD/output',
        name: 'output',
        nodeId: '8eLuD',
        index: 0,
        valueType: 'Structured',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
    },
    globalVariables: {
      ndXJQ: {
        id: 'ndXJQ',
        name: 'loop1_counter',
        valueType: 'Unspecified',
      },
    },
    conditionResults: {},
    variableResults: {},
  };

  const { errors, graphRecords } = computeGraphs({
    edges: flowContent.edges,
    nodeConfigs: flowContent.nodeConfigs,
    startNodeIds: ['hElD9'],
  });

  expect(errors).toEqual({});

  console.log(JSON.stringify(graphRecords, null, 2));

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    edges: flowContent.edges,
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    graphRecords,
    progressObserver: progressObserver,
  });

  // NOTE: We cannot use RxJS marble test here, because it doesn't supported
  // Promise.

  const runFlowResult = await lastValueFrom(obs);

  expect(runFlowResult).toEqual({
    errors: [],
    variableResults: {},
  });

  let n = 0;

  const events = [
    {
      type: 'Started',
      nodeId: 'hElD9',
    },
    {
      type: 'Updated',
      nodeId: 'hElD9',
      result: {
        variableValues: [],
        variableResults: {},
        completedConnectorIds: [],
      },
    },
    {
      type: 'Finished',
      nodeId: 'hElD9',
    },
    {
      type: 'Started',
      nodeId: 'Pk4nQ',
    },
    {
      type: 'Updated',
      nodeId: 'Pk4nQ',
      result: {
        variableResults: {},
      },
    },
    {
      type: 'Finished',
      nodeId: 'Pk4nQ',
    },
    {
      type: 'Started',
      nodeId: '9Ui4x',
    },
    {
      type: 'Updated',
      nodeId: '9Ui4x',
      result: {
        variableResults: {},
      },
    },
    {
      type: 'Finished',
      nodeId: '9Ui4x',
    },
    {
      type: 'Started',
      nodeId: '8eLuD',
    },
    {
      type: 'Updated',
      nodeId: '8eLuD',
      result: {
        completedConnectorIds: ['8eLuD/output'],
        variableResults: {
          '8eLuD/output': { value: 1 },
        },
        variableValues: [1],
      },
    },
    {
      type: 'Finished',
      nodeId: '8eLuD',
    },
    {
      type: 'Started',
      nodeId: 'apgt9',
    },
    {
      type: 'Updated',
      nodeId: 'apgt9',
      result: {
        completedConnectorIds: ['apgt9/MPwJq'],
        conditionResults: {
          'apgt9/MPwJq': {
            conditionId: 'apgt9/MPwJq',
            isConditionMatched: true,
          },
          'apgt9/hTTnq': {
            conditionId: 'apgt9/hTTnq',
            isConditionMatched: false,
          },
        },
        variableResults: {},
      },
    },
    {
      type: 'Finished',
      nodeId: 'apgt9',
    },
    {
      type: 'Started',
      nodeId: 'gHXou',
    },
    {
      type: 'Updated',
      nodeId: 'gHXou',
      result: {
        variableResults: {
          'gHXou/ydJi7': { value: 1 },
        },
        variableValues: [1],
      },
    },
    {
      type: 'Finished',
      nodeId: 'gHXou',
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

  expect(n).toBe(events.length);
});

test('runFlow should execute flow contains Loop node (break with 3 iteration)', async () => {
  const flowContent: CanvasDataV4 = {
    nodes: [
      {
        id: 'hElD9',
        type: 'CANVAS_NODE',
        position: { x: -19.09483463821253, y: -265.6607707725781 },
      },
      {
        id: 'gHXou',
        type: 'CANVAS_NODE',
        position: { x: 703.6137319527363, y: -266.40933463153 },
      },
      {
        id: 'Pk4nQ',
        type: 'CANVAS_NODE',
        position: { x: 346.1089144326161, y: -266.7191761147797 },
      },
      {
        id: '9Ui4x',
        type: 'CANVAS_NODE',
        position: { x: -83.18840761562592, y: -25.87853426888462 },
      },
      {
        id: '5w1jr',
        type: 'CANVAS_NODE',
        position: { x: 1033.359864386586, y: 203.165096849583 },
      },
      {
        id: 'apgt9',
        type: 'CANVAS_NODE',
        position: { x: 660.6073266916932, y: -30.09581077085942 },
      },
      {
        id: '8eLuD',
        type: 'CANVAS_NODE',
        position: { x: 295.045265779434, y: -26.09112557543658 },
      },
    ],
    edges: [
      {
        id: 'ARRdC',
        source: 'hElD9',
        sourceHandle: 'hElD9/mAd36',
        target: 'Pk4nQ',
        targetHandle: 'Pk4nQ/7PZhS',
      },
      {
        id: 'WtDm9',
        source: 'Pk4nQ',
        sourceHandle: 'Pk4nQ/jooB9',
        target: 'gHXou',
        targetHandle: 'gHXou/IgTHW',
      },
      {
        id: 'IKWau',
        source: '9Ui4x',
        sourceHandle: '9Ui4x/aNkK1',
        target: '8eLuD',
        targetHandle: '8eLuD/6HSC3',
      },
      {
        id: 'o8MVx',
        source: '8eLuD',
        sourceHandle: '8eLuD/st2vW',
        target: 'apgt9',
        targetHandle: 'apgt9/ViWA9',
      },
      {
        id: 'SVwnK',
        source: 'apgt9',
        sourceHandle: 'apgt9/hTTnq',
        target: '5w1jr',
        targetHandle: '5w1jr/gphwX',
      },
      {
        id: 'Dwc6R',
        source: 'apgt9',
        sourceHandle: 'apgt9/MPwJq',
        target: '5w1jr',
        targetHandle: '5w1jr/Sv19O',
      },
    ],
    nodeConfigs: {
      '5w1jr': {
        class: 'Finish',
        type: 'LoopFinish',
        nodeId: '5w1jr',
      },
      '8eLuD': {
        class: 'Process',
        type: 'JavaScriptFunctionNode',
        nodeId: '8eLuD',
        javaScriptCode: 'count = count ?? 0\ncount++\nreturn count',
      },
      '9Ui4x': {
        class: 'Start',
        type: 'LoopStart',
        nodeId: '9Ui4x',
        nodeName: 'loop1',
      },
      'Pk4nQ': {
        class: 'Process',
        type: 'Loop',
        nodeId: 'Pk4nQ',
        loopStartNodeId: '9Ui4x',
      },
      'apgt9': {
        class: 'Process',
        type: 'ConditionNode',
        nodeId: 'apgt9',
        stopAtTheFirstMatch: true,
      },
      'gHXou': {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'gHXou',
      },
      'hElD9': {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'hElD9',
        nodeName: 'input',
      },
    },
    connectors: {
      '5w1jr/Sv19O': {
        type: 'InCondition',
        id: '5w1jr/Sv19O',
        nodeId: '5w1jr',
        index: 1,
      },
      '5w1jr/gphwX': {
        type: 'InCondition',
        id: '5w1jr/gphwX',
        nodeId: '5w1jr',
        index: 0,
      },
      '8eLuD/6HSC3': {
        type: 'InCondition',
        id: '8eLuD/6HSC3',
        nodeId: '8eLuD',
      },
      '8eLuD/pooal': {
        type: 'NodeInput',
        id: '8eLuD/pooal',
        name: 'count',
        nodeId: '8eLuD',
        index: 1,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
      '8eLuD/st2vW': {
        type: 'OutCondition',
        id: '8eLuD/st2vW',
        nodeId: '8eLuD',
        index: 0,
        expressionString: '',
      },
      '9Ui4x/aNkK1': {
        type: 'OutCondition',
        id: '9Ui4x/aNkK1',
        nodeId: '9Ui4x',
        index: 0,
        expressionString: '',
      },
      'Pk4nQ/7PZhS': {
        type: 'InCondition',
        id: 'Pk4nQ/7PZhS',
        nodeId: 'Pk4nQ',
        index: 0,
      },
      'Pk4nQ/jooB9': {
        type: 'OutCondition',
        id: 'Pk4nQ/jooB9',
        nodeId: 'Pk4nQ',
        index: 0,
        expressionString: '',
      },
      'apgt9/MPwJq': {
        type: 'OutCondition',
        id: 'apgt9/MPwJq',
        nodeId: 'apgt9',
        index: -1,
        expressionString: '',
      },
      'apgt9/ViWA9': {
        type: 'InCondition',
        id: 'apgt9/ViWA9',
        nodeId: 'apgt9',
      },
      'apgt9/hTTnq': {
        type: 'OutCondition',
        id: 'apgt9/hTTnq',
        nodeId: 'apgt9',
        index: 1,
        expressionString: '$ < 3',
      },
      'apgt9/input': {
        type: 'NodeInput',
        id: 'apgt9/input',
        name: 'input',
        nodeId: 'apgt9',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
      'gHXou/IgTHW': {
        type: 'InCondition',
        id: 'gHXou/IgTHW',
        nodeId: 'gHXou',
      },
      'gHXou/ydJi7': {
        type: 'NodeInput',
        id: 'gHXou/ydJi7',
        name: 'output',
        nodeId: 'gHXou',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
      'hElD9/mAd36': {
        type: 'OutCondition',
        id: 'hElD9/mAd36',
        nodeId: 'hElD9',
        index: 0,
        expressionString: '',
      },
      '8eLuD/output': {
        type: 'NodeOutput',
        id: '8eLuD/output',
        name: 'output',
        nodeId: '8eLuD',
        index: 0,
        valueType: 'Structured',
        isGlobal: true,
        globalVariableId: 'ndXJQ',
      },
    },
    globalVariables: {
      ndXJQ: {
        id: 'ndXJQ',
        name: 'loop1_counter',
        valueType: 'Unspecified',
      },
    },
    conditionResults: {},
    variableResults: {},
  };

  const { errors, graphRecords } = computeGraphs({
    edges: flowContent.edges,
    nodeConfigs: flowContent.nodeConfigs,
    startNodeIds: ['hElD9'],
  });

  expect(errors).toEqual({});

  console.log(JSON.stringify(graphRecords, null, 2));

  const result = getNodeAllLevelConfigOrValidationErrors(
    flowContent.nodeConfigs,
    (nodeType: NodeTypeEnum, fieldKey: string) => '',
  );

  const progressObserver = new ReplaySubject();

  const obs = runFlow({
    edges: flowContent.edges,
    nodeConfigs: result.nodeAllLevelConfigs!,
    connectors: flowContent.connectors,
    inputVariableValues: flowContent.variableResults,
    preferStreaming: false,
    graphRecords,
    progressObserver: progressObserver,
  });

  // NOTE: We cannot use RxJS marble test here, because it doesn't supported
  // Promise.

  const runFlowResult = await lastValueFrom(obs);

  expect(runFlowResult).toEqual({
    errors: [],
    variableResults: {},
  });

  let n = 0;

  function createLoopedEvents(count: number, isFinish: boolean) {
    return [
      {
        type: 'Started',
        nodeId: '9Ui4x',
      },
      {
        type: 'Updated',
        nodeId: '9Ui4x',
        result: {
          variableResults: {},
        },
      },
      {
        type: 'Finished',
        nodeId: '9Ui4x',
      },
      {
        type: 'Started',
        nodeId: '8eLuD',
      },
      {
        type: 'Updated',
        nodeId: '8eLuD',
        result: {
          completedConnectorIds: ['8eLuD/output'],
          variableResults: {
            '8eLuD/output': { value: count },
          },
          variableValues: [count],
        },
      },
      {
        type: 'Finished',
        nodeId: '8eLuD',
      },
      {
        type: 'Started',
        nodeId: 'apgt9',
      },
      {
        type: 'Updated',
        nodeId: 'apgt9',
        result: isFinish
          ? {
              completedConnectorIds: ['apgt9/MPwJq'],
              conditionResults: {
                'apgt9/hTTnq': {
                  conditionId: 'apgt9/hTTnq',
                  isConditionMatched: false,
                },
                'apgt9/MPwJq': {
                  conditionId: 'apgt9/MPwJq',
                  isConditionMatched: true,
                },
              },
              variableResults: {},
            }
          : {
              completedConnectorIds: ['apgt9/hTTnq'],
              conditionResults: {
                'apgt9/hTTnq': {
                  conditionId: 'apgt9/hTTnq',
                  isConditionMatched: true,
                },
              },
              variableResults: {},
            },
      },
      {
        type: 'Finished',
        nodeId: 'apgt9',
      },
    ];
  }

  const events = [
    {
      type: 'Started',
      nodeId: 'hElD9',
    },
    {
      type: 'Updated',
      nodeId: 'hElD9',
      result: {
        variableValues: [],
        variableResults: {},
        completedConnectorIds: [],
      },
    },
    {
      type: 'Finished',
      nodeId: 'hElD9',
    },
    {
      type: 'Started',
      nodeId: 'Pk4nQ',
    },
    {
      type: 'Updated',
      nodeId: 'Pk4nQ',
      result: {
        variableResults: {},
      },
    },
    {
      type: 'Finished',
      nodeId: 'Pk4nQ',
    },
    ...createLoopedEvents(1, false),
    ...createLoopedEvents(2, false),
    ...createLoopedEvents(3, true),
    {
      type: 'Started',
      nodeId: 'gHXou',
    },
    {
      type: 'Updated',
      nodeId: 'gHXou',
      result: {
        variableResults: {
          'gHXou/ydJi7': { value: 3 },
        },
        variableValues: [3],
      },
    },
    {
      type: 'Finished',
      nodeId: 'gHXou',
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

  expect(n).toBe(events.length);
});

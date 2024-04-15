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
            isConditionMatched: false,
          },
          '1w9JM/MlBLI': {
            isConditionMatched: false,
          },
          '1w9JM/fR2hj': {
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
        id: '1l3Xq',
        type: 'CANVAS_NODE',
        position: {
          x: 51.921875,
          y: 103.265625,
        },
      },
      {
        id: 'CpzTz',
        type: 'CANVAS_NODE',
        position: {
          x: 759.7265625,
          y: 100.828125,
        },
      },
      {
        id: 'Z8YCo',
        type: 'CANVAS_NODE',
        position: {
          x: 406.6796875,
          y: 102.7734375,
        },
      },
      {
        id: 's8ujd',
        type: 'CANVAS_NODE',
        position: {
          x: 51.6796875,
          y: 332.7734375,
        },
      },
      {
        id: 'OBXCA',
        type: 'CANVAS_NODE',
        position: {
          x: 762.6796875,
          y: 321.7734375,
        },
      },
      {
        id: 'GXLmB',
        type: 'CANVAS_NODE',
        position: {
          x: 404.06640625,
          y: 332.2265625,
        },
      },
    ],
    edges: [
      {
        id: 'A2R53',
        source: '1l3Xq',
        sourceHandle: '1l3Xq/477rI',
        target: 'Z8YCo',
        targetHandle: 'Z8YCo/EYDez',
      },
      {
        id: 'bSdKi',
        source: 'Z8YCo',
        sourceHandle: 'Z8YCo/TktVe',
        target: 'CpzTz',
        targetHandle: 'CpzTz/kMAxe',
      },
      {
        id: 'nKHKV',
        source: 's8ujd',
        sourceHandle: 's8ujd/EDGwo',
        target: 'GXLmB',
        targetHandle: 'GXLmB/KDB8a',
      },
      {
        id: 'pajoE',
        source: 'GXLmB',
        sourceHandle: 'GXLmB/0epml',
        target: 'OBXCA',
        targetHandle: 'OBXCA/E0duy',
      },
    ],
    nodeConfigs: {
      '1l3Xq': {
        class: 'Start',
        type: 'InputNode',
        nodeId: '1l3Xq',
        nodeName: 'input',
      },
      'CpzTz': {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'CpzTz',
      },
      'GXLmB': {
        class: 'Process',
        type: 'JavaScriptFunctionNode',
        nodeId: 'GXLmB',
        javaScriptCode: 'input = input ?? 0\ninput++\nreturn input',
      },
      'OBXCA': {
        class: 'Finish',
        type: 'LoopFinish',
        nodeId: 'OBXCA',
      },
      'Z8YCo': {
        class: 'Process',
        type: 'Loop',
        nodeId: 'Z8YCo',
        loopStartNodeId: 's8ujd',
      },
      's8ujd': {
        class: 'Start',
        type: 'LoopStart',
        nodeId: 's8ujd',
        nodeName: 'loop start 1',
      },
    },
    connectors: {
      '1l3Xq/477rI': {
        type: 'OutCondition',
        id: '1l3Xq/477rI',
        nodeId: '1l3Xq',
        index: 0,
        expressionString: '',
      },
      'CpzTz/TSV9x': {
        type: 'NodeInput',
        id: 'CpzTz/TSV9x',
        name: 'output',
        nodeId: 'CpzTz',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'rM3Wc',
      },
      'CpzTz/kMAxe': {
        type: 'InCondition',
        id: 'CpzTz/kMAxe',
        nodeId: 'CpzTz',
      },
      'GXLmB/0epml': {
        type: 'OutCondition',
        id: 'GXLmB/0epml',
        nodeId: 'GXLmB',
        index: 0,
        expressionString: '',
      },
      'GXLmB/JohhB': {
        type: 'NodeInput',
        id: 'GXLmB/JohhB',
        name: 'input',
        nodeId: 'GXLmB',
        index: 1,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'rM3Wc',
      },
      'GXLmB/KDB8a': {
        type: 'InCondition',
        id: 'GXLmB/KDB8a',
        nodeId: 'GXLmB',
      },
      'OBXCA/E0duy': {
        type: 'InCondition',
        id: 'OBXCA/E0duy',
        nodeId: 'OBXCA',
        index: 1,
      },
      'OBXCA/NsiKt': {
        type: 'InCondition',
        id: 'OBXCA/NsiKt',
        nodeId: 'OBXCA',
        index: 0,
      },
      'Z8YCo/EYDez': {
        type: 'InCondition',
        id: 'Z8YCo/EYDez',
        nodeId: 'Z8YCo',
        index: 0,
      },
      'Z8YCo/TktVe': {
        type: 'OutCondition',
        id: 'Z8YCo/TktVe',
        nodeId: 'Z8YCo',
        index: 0,
        expressionString: '',
      },
      's8ujd/EDGwo': {
        type: 'OutCondition',
        id: 's8ujd/EDGwo',
        nodeId: 's8ujd',
        index: 0,
        expressionString: '',
      },
      'GXLmB/output': {
        type: 'NodeOutput',
        id: 'GXLmB/output',
        name: 'output',
        nodeId: 'GXLmB',
        index: 0,
        valueType: 'Structured',
        isGlobal: true,
        globalVariableId: 'rM3Wc',
      },
    },
    globalVariables: {
      rM3Wc: {
        id: 'rM3Wc',
        name: 'count',
        valueType: 'Unspecified',
      },
    },
    conditionResults: {},
    variableResults: {},
  };

  const { errors, graphRecords } = computeGraphs({
    edges: flowContent.edges,
    nodeConfigs: flowContent.nodeConfigs,
    startNodeIds: ['1l3Xq'],
  });

  expect(errors, 'should not have any error').toEqual({});

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
    variableResults: {
      'CpzTz/TSV9x': {
        value: 1,
      },
    },
  });

  let n = 0;

  const loopEvents = [
    // #4
    {
      type: 'Started',
      nodeId: 's8ujd',
    },
    // #5
    {
      type: 'Updated',
      nodeId: 's8ujd',
      result: {
        variableResults: {},
      },
    },
    // #6
    {
      type: 'Finished',
      nodeId: 's8ujd',
    },
    // #7
    {
      type: 'Started',
      nodeId: 'GXLmB',
    },
    // #8
    {
      type: 'Updated',
      nodeId: 'GXLmB',
      result: {
        completedConnectorIds: ['GXLmB/output'],
        variableResults: {
          'GXLmB/output': { value: 1 },
        },
        variableValues: [1],
      },
    },
    // #9
    {
      type: 'Finished',
      nodeId: 'GXLmB',
    },
    // #10
    {
      type: 'Started',
      nodeId: 'OBXCA',
    },
    // #11
    {
      type: 'Updated',
      nodeId: 'OBXCA',
      result: {
        variableResults: {},
      },
    },
    // #12
    {
      type: 'Finished',
      nodeId: 'OBXCA',
    },
    // TODO: This is a bug where LoopFinish events will repeat
    // #13
    {
      type: 'Started',
      nodeId: 'OBXCA',
    },
    // #14
    {
      type: 'Updated',
      nodeId: 'OBXCA',
      result: {},
    },
    // #15
    {
      type: 'Finished',
      nodeId: 'OBXCA',
    },
  ];

  const events = [
    // #0
    {
      type: 'Started',
      nodeId: '1l3Xq',
    },
    // #1
    {
      type: 'Updated',
      nodeId: '1l3Xq',
      result: {
        variableValues: [],
        variableResults: {},
        completedConnectorIds: [],
      },
    },
    // #2
    {
      type: 'Finished',
      nodeId: '1l3Xq',
    },
    // #3
    {
      type: 'Started',
      nodeId: 'Z8YCo',
    },
    ...loopEvents,
    // #16
    {
      type: 'Finished',
      nodeId: 'Z8YCo',
    },
    // #17
    {
      type: 'Started',
      nodeId: 'CpzTz',
    },
    // #18
    {
      type: 'Updated',
      nodeId: 'CpzTz',
      result: {
        variableResults: {
          'CpzTz/TSV9x': { value: 1 },
        },
        variableValues: [1],
      },
    },
    // #19
    {
      type: 'Finished',
      nodeId: 'CpzTz',
    },
  ];

  // NOTE: Must use tap to wrap assertion because subscribe doesn't stop
  // the observable on exception.
  await lastValueFrom(
    progressObserver.pipe(
      tap((event) => {
        expect(event, `should equal to events[${n}]`).toEqual(events[n]);
        n++;
      }),
    ),
  );

  expect(n, 'should go through all events').toBe(events.length);
});

test('runFlow should execute flow contains Loop node (break with 3 iteration)', async () => {
  const flowContent: CanvasDataV4 = {
    nodes: [
      {
        id: 'ZQiRL',
        type: 'CANVAS_NODE',
        position: {
          x: 218.54296875,
          y: 183.125,
        },
      },
      {
        id: 'UQgWR',
        type: 'CANVAS_NODE',
        position: {
          x: 931.04296875,
          y: 182.5,
        },
      },
      {
        id: 'fzwwo',
        type: 'CANVAS_NODE',
        position: {
          x: 576.41796875,
          y: 182.9375,
        },
      },
      {
        id: 'nL4HL',
        type: 'CANVAS_NODE',
        position: {
          x: 84.41796875,
          y: 386.9375,
        },
      },
      {
        id: 'jYEcZ',
        type: 'CANVAS_NODE',
        position: {
          x: 1135.41796875,
          y: 575.9375,
        },
      },
      {
        id: 'Kuvae',
        type: 'CANVAS_NODE',
        position: {
          x: 432.41796875,
          y: 387.4375,
        },
      },
      {
        id: 'F5gKh',
        type: 'CANVAS_NODE',
        position: {
          x: 781.98046875,
          y: 387.125,
        },
      },
    ],
    edges: [
      {
        id: 'jjo6p',
        source: 'ZQiRL',
        sourceHandle: 'ZQiRL/DZPYU',
        target: 'fzwwo',
        targetHandle: 'fzwwo/6S2RW',
      },
      {
        id: 'YwMpI',
        source: 'fzwwo',
        sourceHandle: 'fzwwo/I8zZC',
        target: 'UQgWR',
        targetHandle: 'UQgWR/m5pTy',
      },
      {
        id: 'SbEeO',
        source: 'Kuvae',
        sourceHandle: 'Kuvae/GFaAp',
        target: 'F5gKh',
        targetHandle: 'F5gKh/8KAxu',
      },
      {
        id: 'LTcqa',
        source: 'nL4HL',
        sourceHandle: 'nL4HL/8H1w7',
        target: 'Kuvae',
        targetHandle: 'Kuvae/6Iv2V',
      },
      {
        id: 'iJvcT',
        source: 'F5gKh',
        sourceHandle: 'F5gKh/gfRUp',
        target: 'jYEcZ',
        targetHandle: 'jYEcZ/A53Z2',
      },
      {
        id: '6xfXL',
        source: 'F5gKh',
        sourceHandle: 'F5gKh/cGnHI',
        target: 'jYEcZ',
        targetHandle: 'jYEcZ/AitYg',
      },
    ],
    nodeConfigs: {
      F5gKh: {
        class: 'Process',
        type: 'ConditionNode',
        nodeId: 'F5gKh',
        stopAtTheFirstMatch: true,
      },
      Kuvae: {
        class: 'Process',
        type: 'JavaScriptFunctionNode',
        nodeId: 'Kuvae',
        javaScriptCode: 'input = input ?? 0\ninput++\nreturn input',
      },
      UQgWR: {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'UQgWR',
      },
      ZQiRL: {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'ZQiRL',
        nodeName: 'input',
      },
      fzwwo: {
        class: 'Process',
        type: 'Loop',
        nodeId: 'fzwwo',
        loopStartNodeId: 'nL4HL',
      },
      jYEcZ: {
        class: 'Finish',
        type: 'LoopFinish',
        nodeId: 'jYEcZ',
      },
      nL4HL: {
        class: 'Start',
        type: 'LoopStart',
        nodeId: 'nL4HL',
        nodeName: 'loop start 1',
      },
    },
    connectors: {
      'F5gKh/8KAxu': {
        type: 'InCondition',
        id: 'F5gKh/8KAxu',
        nodeId: 'F5gKh',
      },
      'F5gKh/cGnHI': {
        type: 'OutCondition',
        id: 'F5gKh/cGnHI',
        nodeId: 'F5gKh',
        index: -1,
        expressionString: '',
      },
      'F5gKh/gfRUp': {
        type: 'OutCondition',
        id: 'F5gKh/gfRUp',
        nodeId: 'F5gKh',
        index: 0,
        expressionString: '$ < 3',
      },
      'F5gKh/input': {
        type: 'NodeInput',
        id: 'F5gKh/input',
        name: 'input',
        nodeId: 'F5gKh',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'wR0gO',
      },
      'Kuvae/6Iv2V': {
        type: 'InCondition',
        id: 'Kuvae/6Iv2V',
        nodeId: 'Kuvae',
      },
      'Kuvae/GFaAp': {
        type: 'OutCondition',
        id: 'Kuvae/GFaAp',
        nodeId: 'Kuvae',
        index: 0,
        expressionString: '',
      },
      'Kuvae/q5O9l': {
        type: 'NodeInput',
        id: 'Kuvae/q5O9l',
        name: 'input',
        nodeId: 'Kuvae',
        index: 1,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'wR0gO',
      },
      'UQgWR/bAOpK': {
        type: 'NodeInput',
        id: 'UQgWR/bAOpK',
        name: 'output',
        nodeId: 'UQgWR',
        index: 0,
        valueType: 'Any',
        isGlobal: true,
        globalVariableId: 'wR0gO',
      },
      'UQgWR/m5pTy': {
        type: 'InCondition',
        id: 'UQgWR/m5pTy',
        nodeId: 'UQgWR',
      },
      'ZQiRL/DZPYU': {
        type: 'OutCondition',
        id: 'ZQiRL/DZPYU',
        nodeId: 'ZQiRL',
        index: 0,
        expressionString: '',
      },
      'fzwwo/6S2RW': {
        type: 'InCondition',
        id: 'fzwwo/6S2RW',
        nodeId: 'fzwwo',
        index: 0,
      },
      'fzwwo/I8zZC': {
        type: 'OutCondition',
        id: 'fzwwo/I8zZC',
        nodeId: 'fzwwo',
        index: 0,
        expressionString: '',
      },
      'jYEcZ/A53Z2': {
        type: 'InCondition',
        id: 'jYEcZ/A53Z2',
        nodeId: 'jYEcZ',
        index: 0,
      },
      'jYEcZ/AitYg': {
        type: 'InCondition',
        id: 'jYEcZ/AitYg',
        nodeId: 'jYEcZ',
        index: 1,
      },
      'nL4HL/8H1w7': {
        type: 'OutCondition',
        id: 'nL4HL/8H1w7',
        nodeId: 'nL4HL',
        index: 0,
        expressionString: '',
      },
      'Kuvae/output': {
        type: 'NodeOutput',
        id: 'Kuvae/output',
        name: 'output',
        nodeId: 'Kuvae',
        index: 0,
        valueType: 'Structured',
        isGlobal: true,
        globalVariableId: 'wR0gO',
      },
    },
    globalVariables: {
      wR0gO: {
        id: 'wR0gO',
        name: 'count',
        valueType: 'Unspecified',
      },
    },
    conditionResults: {},
    variableResults: {},
  };

  const { errors, graphRecords } = computeGraphs({
    edges: flowContent.edges,
    nodeConfigs: flowContent.nodeConfigs,
    startNodeIds: ['ZQiRL'],
  });

  expect(errors, 'should not have any error').toEqual({});

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
    variableResults: {
      'UQgWR/bAOpK': { value: 3 },
    },
  });

  let n = 0;

  function createLoopedEvents(count: number, isFinish: boolean) {
    return [
      // #4, #16, #28
      {
        type: 'Started',
        nodeId: 'nL4HL',
      },
      // #5, #17, #29
      {
        type: 'Updated',
        nodeId: 'nL4HL',
        result: {
          variableResults: {},
        },
      },
      // #6, #18, #30
      {
        type: 'Finished',
        nodeId: 'nL4HL',
      },
      // #7, #19, #31
      {
        type: 'Started',
        nodeId: 'Kuvae',
      },
      // #8, #20, #32
      {
        type: 'Updated',
        nodeId: 'Kuvae',
        result: {
          completedConnectorIds: ['Kuvae/output'],
          variableResults: {
            'Kuvae/output': { value: count },
          },
          variableValues: [count],
        },
      },
      // #9, #21, #33
      {
        type: 'Finished',
        nodeId: 'Kuvae',
      },
      // #10, #22, #34
      {
        type: 'Started',
        nodeId: 'F5gKh',
      },
      // #11, #23, #35
      {
        type: 'Updated',
        nodeId: 'F5gKh',
        result: !isFinish
          ? {
              completedConnectorIds: ['F5gKh/gfRUp'],
              conditionResults: {
                'F5gKh/gfRUp': {
                  isConditionMatched: true,
                },
              },
              variableResults: {},
            }
          : {
              completedConnectorIds: ['F5gKh/cGnHI'],
              conditionResults: {
                'F5gKh/gfRUp': {
                  isConditionMatched: false,
                },
                'F5gKh/cGnHI': {
                  isConditionMatched: true,
                },
              },
              variableResults: {},
            },
      },
      // #12, #24, #36
      {
        type: 'Finished',
        nodeId: 'F5gKh',
      },
      // #13, #25, #37
      {
        type: 'Started',
        nodeId: 'jYEcZ',
      },
      // #14, #26, #38
      {
        type: 'Updated',
        nodeId: 'jYEcZ',
        result: {},
      },
      // #15, #27, #39
      {
        type: 'Finished',
        nodeId: 'jYEcZ',
      },
    ];
  }

  const events = [
    // #0
    {
      type: 'Started',
      nodeId: 'ZQiRL',
    },
    // #1
    {
      type: 'Updated',
      nodeId: 'ZQiRL',
      result: {
        variableValues: [],
        variableResults: {},
        completedConnectorIds: [],
      },
    },
    // #2
    {
      type: 'Finished',
      nodeId: 'ZQiRL',
    },
    // #3
    {
      type: 'Started',
      nodeId: 'fzwwo',
    },
    ...createLoopedEvents(1, false),
    ...createLoopedEvents(2, false),
    ...createLoopedEvents(3, true),
    // #40
    {
      type: 'Finished',
      nodeId: 'fzwwo',
    },
    // #41
    {
      type: 'Started',
      nodeId: 'UQgWR',
    },
    // #42
    {
      type: 'Updated',
      nodeId: 'UQgWR',
      result: {
        variableResults: {
          'UQgWR/bAOpK': { value: 3 },
        },
        variableValues: [3],
      },
    },
    // #43
    {
      type: 'Finished',
      nodeId: 'UQgWR',
    },
  ];

  // NOTE: Must use tap to wrap assertion because subscribe doesn't stop
  // the observable on exception.
  await lastValueFrom(
    progressObserver.pipe(
      tap((event) => {
        expect(event, `should equal to events[${n}]`).toEqual(events[n]);
        n++;
      }),
    ),
  );

  expect(n, 'should go through all events').toBe(events.length);
});
